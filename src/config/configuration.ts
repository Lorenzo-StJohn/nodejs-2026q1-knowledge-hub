import { Injectable } from '@nestjs/common';

@Injectable()
export class Configuration {
  get port(): number {
    return parseInt(process.env.PORT || '4000', 10);
  }

  get isMemoryMode(): boolean {
    return process.env.MODE === 'memory';
  }

  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  get apiVariables() {
    return {
      url:
        process.env.GEMINI_API_BASE ??
        'https://generativelanguage.googleapis.com',
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
    };
  }
}
