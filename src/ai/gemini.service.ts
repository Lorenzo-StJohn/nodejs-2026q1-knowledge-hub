import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { Configuration } from 'src/config/configuration';
import {
  TooManyRequestsError,
  UnauthorizedError,
} from 'src/common/exceptions/custom-errors';

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

  async generate(prompt: string) {
    if (!this.apiKey) {
      throw new UnauthorizedError();
    }

    const url = `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload),
      );

      return response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
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
}
