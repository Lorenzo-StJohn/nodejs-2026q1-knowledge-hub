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
      url: process.env.GEMINI_API_BASE,
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
    };
  }
}
