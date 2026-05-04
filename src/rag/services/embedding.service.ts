import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Configuration } from 'src/config/configuration';

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
    const url = `${this.baseUrl}/v1beta/models/${this.model}:batchEmbedContents?key=${this.apiKey}`;
    const requests = texts.map((t) => ({
      model: `models/${this.model}`,
      content: { parts: [{ text: t }] },
    }));

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, { requests }, { timeout: 20000 }),
      );
      const embeddings = response.data.embeddings.map(
        (e: any) => e.values as number[],
      );
      return embeddings;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        throw new ServiceUnavailableException(
          'Embedding service quota exceeded',
        );
      }
      if (axiosError.code === 'ECONNABORTED' || !axiosError.response) {
        throw new ServiceUnavailableException('Embedding service unavailable');
      }
      throw new InternalServerErrorException('Embedding generation failed');
    }
  }
}
