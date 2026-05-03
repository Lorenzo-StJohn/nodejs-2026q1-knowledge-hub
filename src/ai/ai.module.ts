import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AiController } from './ai.controller';
import { GeminiService } from './gemini.service';
import { ConfigModule } from '../config/config.module';
import { OutgoingLoggingInterceptor } from 'src/common/interceptors/outgoing-logging.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ArticleModule } from 'src/modules/article/article.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { Configuration } from 'src/config/configuration';
import { AiCacheService } from './ai-cache.service';
import { AiUsageTrackerService } from './ai-usage-tracker.service';
import { AppLogger } from 'src/common/logger/logger.service';

@Module({
  imports: [
    ConfigModule,
    ArticleModule,
    CacheModule.register({ isGlobal: true, ttl: 0 }),
    HttpModule.register({
      timeout: 15000,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [Configuration],
      useFactory: (config: Configuration) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: config.aiRateLimitRpm,
          },
        ],
      }),
    }),
  ],
  controllers: [AiController],
  providers: [
    GeminiService,
    OutgoingLoggingInterceptor,
    AiCacheService,
    AiUsageTrackerService,
    AppLogger,
  ],
})
export class AiModule {}
