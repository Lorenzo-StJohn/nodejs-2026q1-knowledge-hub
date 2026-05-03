import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Configuration } from 'src/config/configuration';

@Injectable()
export class AiCacheService {
  private readonly ttl: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private config: Configuration,
  ) {
    this.ttl = +this.config.aiCacheTtlSec * 1000;
  }

  async get(key: string): Promise<any> {
    return this.cacheManager.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    await this.cacheManager.set(key, value, this.ttl);
  }
}
