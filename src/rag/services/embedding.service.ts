import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Configuration } from 'src/config/configuration';
import { sleep } from 'src/common/utils/sleep.util';

@Injectable()
export class EmbeddingService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: Configuration,
  ) {
    this.apiKey = this.config.apiEmbedding.key;
    this.baseUrl = this.config.apiEmbedding.url;
    this.model = this.config.apiEmbedding.model;
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    const batchSize = 100;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const chunk = texts.slice(i, i + batchSize);
      const embeddings = await this.embedBatch(chunk);
      results.push(...embeddings);
      if (i + batchSize < texts.length) {
        await sleep(4000);
      }
    }

    return results;
  }

  private async embedBatch(texts: string[]): Promise<number[][]> {
    const url = `${this.baseUrl}/v1beta/models/${this.model}:batchEmbedContents?key=${this.apiKey}`;

    const payload = {
      requests: texts.map((text) => ({
        model: `models/${this.model}`,
        content: { parts: [{ text }] },
      })),
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, payload, { timeout: 30000 }),
      );

      return response.data.embeddings.map((e: any) => e.values);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        throw new ServiceUnavailableException(
          'Embedding service quota exceeded',
        );
      }
      if (axiosError.code === 'ECONNABORTED' || !axiosError.response) {
        throw new ServiceUnavailableException(
          'Embedding service network/timeout error',
        );
      }
      throw new InternalServerErrorException('Embedding generation failed');
    }
  }
}
