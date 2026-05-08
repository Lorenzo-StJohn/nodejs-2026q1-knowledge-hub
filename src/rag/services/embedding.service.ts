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
    const maxConcurrency = 5;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += maxConcurrency) {
      const batch = texts.slice(i, i + maxConcurrency);
      const embeddings = await Promise.all(
        batch.map((text) => this.embedSingle(text)),
      );
      results.push(...embeddings);

      if (i + maxConcurrency < texts.length) {
        await sleep(1200);
      }
    }

    return results;
  }

  private async embedSingle(text: string): Promise<number[]> {
    const url = `${this.baseUrl}/v1beta/models/${this.model}:embedContent?key=${this.apiKey}`;
    const payload = {
      content: { parts: [{ text }] },
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, payload, { timeout: 20000 }),
      );
      return response.data.embedding.values;
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
