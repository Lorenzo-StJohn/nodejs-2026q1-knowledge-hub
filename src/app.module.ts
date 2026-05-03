import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { UserModule } from './modules/user/user.module';
import { PersistenceModule } from './infrastructure/persistence.module';
import { ArticleModule } from './modules/article/article.module';
import { CategoryModule } from './modules/category/category.module';
import { CommentModule } from './modules/comment/comment.module';
import { AuthModule } from './auth/auth.module';
import { AppLogger } from './common/logger/logger.service';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 60000,
          limit: 200,
        },
        {
          name: 'long',
          ttl: 3600000,
          limit: 2000,
        },
        {
          name: 'ai',
          ttl: 60000,
          limit: parseInt(process.env.AI_RATE_LIMIT_RPM || '20', 10),
        },
      ],
    }),
    ConfigModule,
    UserModule,
    PersistenceModule,
    ArticleModule,
    CategoryModule,
    CommentModule,
    AuthModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLogger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [AppLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
