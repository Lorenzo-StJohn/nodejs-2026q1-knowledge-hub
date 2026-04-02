import { Injectable } from '@nestjs/common';

@Injectable()
export class Configuration {
  get port(): number {
    return parseInt(process.env.PORT || '4000', 10);
  }

  get isMemoryMode(): boolean {
    return true;
  }
}
