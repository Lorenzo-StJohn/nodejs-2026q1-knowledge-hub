import { Injectable } from '@nestjs/common';
import { Configuration } from './config/configuration';

@Injectable()
export class AppService {
  constructor(private readonly config: Configuration) {}

  getHello(): string {
    const port = this.config.port;
    return `Go to http://localhost:${port}/doc/ see documentation`;
  }
}
