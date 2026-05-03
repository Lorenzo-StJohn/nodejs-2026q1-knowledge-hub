import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { Configuration } from 'src/config/configuration';
import {
  TooManyRequestsError,
  UnauthorizedError,
} from 'src/common/exceptions/custom-errors';

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
      throw new UnauthorizedError();
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
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      if (status === 429) throw new TooManyRequestsError();
      if (status === 401) throw new UnauthorizedError();

      throw new InternalServerErrorException(
        axiosError.message || 'Gemini API Error',
      );
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
        if (axiosError.response?.status === 429) {
          // Gemini rate limit
          const delay = baseDelay * Math.pow(2, i);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else if (
          axiosError.code === 'ECONNABORTED' ||
          axiosError.code === 'ERR_NETWORK'
        ) {
          // timeout/network
          const delay = baseDelay * Math.pow(2, i);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error; // unrecoverable
        }
      }
    }
    throw new Error('Retries exhausted');
  }
}
