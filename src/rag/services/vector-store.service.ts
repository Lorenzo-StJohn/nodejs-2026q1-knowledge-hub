import {
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
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
  private client: QdrantClient;
  private collectionName: string;

  constructor(private readonly config: Configuration) {
    this.collectionName = this.config.ragVectorCollection;
  }

  async onModuleInit() {
    const url = this.config.ragVectorDbUrl;
    this.client = new QdrantClient({ url });
    await this.ensureCollection();
  }

  async ensureCollection() {
    try {
      const collections = await this.client.getCollections();
      if (
        !collections.collections.find((c) => c.name === this.collectionName)
      ) {
        await this.client.createCollection(this.collectionName, {
          vectors: { size: 768, distance: 'Cosine' },
        });
      }
    } catch (error) {
      throw new ServiceUnavailableException('Vector database is not available');
    }
  }

  async upsert(points: VectorPoint[]) {
    await this.client.upsert(this.collectionName, {
      wait: true,
      points: points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload,
      })),
    });
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
      must.push({
        key: 'tags',
        match: { any: filters.tags },
      });
    }

    const results = await this.client.search(this.collectionName, {
      vector,
      limit,
      filter: must.length > 0 ? { must } : undefined,
      with_payload: true,
    });
    return results.map((r) => ({
      id: r.id as string,
      payload: r.payload as any,
      score: r.score,
    }));
  }

  async deleteByArticleId(articleId: string): Promise<number> {
    await this.client.delete(this.collectionName, {
      filter: { must: [{ key: 'articleId', match: { value: articleId } }] },
    });
    return 0;
  }

  async countPointsForArticle(articleId: string): Promise<number> {
    const result = await this.client.count(this.collectionName, {
      filter: { must: [{ key: 'articleId', match: { value: articleId } }] },
    });
    return result.count;
  }
}
