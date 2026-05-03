import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { Configuration } from 'src/config/configuration';

export interface generationConfig {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
}

@Injectable()
export class GeminiService {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    private readonly config: Configuration,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.config.apiVariables.key;
    this.baseUrl = this.config.apiVariables.url;
    this.model = this.config.apiVariables.model;
  }

  async generate(prompt: string, generationConfig?: generationConfig) {
    if (!this.apiKey) {
      throw new InternalServerErrorException('AI service is not configured');
    }

    const url = `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    };

    try {
      const response = await this.retryWithBackoff(() =>
        lastValueFrom(this.httpService.post(url, payload, { timeout: 15000 })),
      );

      const text =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const usage = response.data.usageMetadata;
      return { text, usage };
    } catch (error: any) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const code = axiosError.code;

      if (status === 429) {
        throw new ServiceUnavailableException(
          'AI service temporarily unavailable (upstream rate limit)',
        );
      }
      if (status === 400 || status === 401 || status === 403) {
        throw new InternalServerErrorException(
          'AI service configuration error',
        );
      }
      if (
        code === 'ECONNABORTED' ||
        code === 'ERR_NETWORK' ||
        code === 'ETIMEDOUT' ||
        code === 'ECONNRESET'
      ) {
        throw new ServiceUnavailableException(
          'AI service network or timeout error',
        );
      }

      throw new InternalServerErrorException('AI service error');
    }
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = 3,
    baseDelay = 1000,
  ): Promise<T> {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries) throw error;
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        const code = axiosError.code;

        if (
          status === 429 ||
          code === 'ECONNABORTED' ||
          code === 'ERR_NETWORK' ||
          code === 'ETIMEDOUT' ||
          code === 'ECONNRESET'
        ) {
          const delay = baseDelay * Math.pow(2, i);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Retries exhausted');
  }

  async generateWithContext(
    history: { role: string; text: string }[],
    currentPrompt: string,
    config?,
  ) {
    const contextPrompt = history
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');
    const fullPrompt = contextPrompt
      ? `${contextPrompt}\nUser: ${currentPrompt}\nAssistant:`
      : `User: ${currentPrompt}\nAssistant:`;
    return this.generate(fullPrompt, config);
  }
}
