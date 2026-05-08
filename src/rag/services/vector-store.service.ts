import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Configuration } from 'src/config/configuration';

export interface VectorPoint {
  id: string;
  vector: number[];
  payload: {
    articleId: string;
    title: string;
    chunk: string;
    chunkIndex: number;
    status?: string;
    categoryId?: string;
    tags?: string[];
  };
}

@Injectable()
export class VectorStoreService implements OnModuleInit {
  private collectionName: string;
  private baseUrl: string;
  private ragVectorSize: number;

  constructor(
    private readonly config: Configuration,
    private readonly httpService: HttpService,
  ) {
    this.collectionName = this.config.ragVectorCollection;
    this.baseUrl = this.config.ragVectorDbUrl;
    this.ragVectorSize = this.config.ragVectorSize;
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  private async ensureCollection() {
    try {
      await lastValueFrom(
        this.httpService.put(
          `${this.baseUrl}/collections/${this.collectionName}`,
          {
            vectors: {
              size: this.ragVectorSize,
              distance: 'Cosine',
            },
          },
        ),
      );
    } catch (error) {
      const axiosError = error as any;
      if (axiosError.response?.status !== 409) {
        throw new ServiceUnavailableException(
          'Vector database is not available',
        );
      }
    }
  }

  private validatePoint(point: VectorPoint) {
    if (!point.vector || point.vector.length !== this.ragVectorSize) {
      throw new Error(
        `Invalid vector dimension: expected 3072, got ${point.vector?.length}`,
      );
    }
    if (
      point.vector.some(
        (v) => typeof v !== 'number' || isNaN(v) || !isFinite(v),
      )
    ) {
      throw new Error('Vector contains NaN or Infinity');
    }
    if (!point.id) {
      throw new Error('Point id is required');
    }
  }

  private cleanPayload(payload: Record<string, any>) {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(payload)) {
      const value = payload[key];
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  async upsert(points: VectorPoint[]) {
    if (points.length === 0) return;

    points.forEach((p) => this.validatePoint(p));

    const url = `${this.baseUrl}/collections/${this.collectionName}/points?wait=true`;

    const body = {
      points: points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: this.cleanPayload(p.payload),
      })),
    };

    try {
      await lastValueFrom(this.httpService.put(url, body, { timeout: 15000 }));
    } catch (error) {
      throw new ServiceUnavailableException('Failed to store vectors');
    }
  }

  async search(
    vector: number[],
    limit: number = 5,
    filters?: { articleStatus?: string; categoryId?: string; tags?: string[] },
  ) {
    const must: any[] = [];
    if (filters?.articleStatus) {
      must.push({ key: 'status', match: { value: filters.articleStatus } });
    }
    if (filters?.categoryId) {
      must.push({ key: 'categoryId', match: { value: filters.categoryId } });
    }
    if (filters?.tags && filters.tags.length > 0) {
      must.push({ key: 'tags', match: { any: filters.tags } });
    }

    const url = `${this.baseUrl}/collections/${this.collectionName}/points/search`;
    try {
      const { data } = await lastValueFrom(
        this.httpService.post(url, {
          vector,
          limit,
          filter: must.length > 0 ? { must } : undefined,
          with_payload: true,
        }),
      );
      return data.result.map((r: any) => ({
        id: r.id,
        payload: r.payload,
        score: r.score,
      }));
    } catch (error) {
      throw new ServiceUnavailableException('Search failed');
    }
  }

  async deleteByArticleId(articleId: string) {
    const url = `${this.baseUrl}/collections/${this.collectionName}/points/delete?wait=true`;
    try {
      await lastValueFrom(
        this.httpService.post(url, {
          filter: { must: [{ key: 'articleId', match: { value: articleId } }] },
        }),
      );
    } catch (error) {
      throw new ServiceUnavailableException('Failed to remove vectors');
    }
  }

  async countPointsForArticle(articleId: string): Promise<number> {
    const url = `${this.baseUrl}/collections/${this.collectionName}/points/count`;
    try {
      const { data } = await lastValueFrom(
        this.httpService.post(url, {
          filter: { must: [{ key: 'articleId', match: { value: articleId } }] },
        }),
      );
      return data.result?.count ?? 0;
    } catch (error) {
      throw new ServiceUnavailableException('Failed to count vectors');
    }
  }
}
