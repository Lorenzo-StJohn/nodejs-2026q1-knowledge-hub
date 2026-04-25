import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

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
      ],
    }),
    ConfigModule,
    UserModule,
    PersistenceModule,
    ArticleModule,
    CategoryModule,
    CommentModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppLogger],
  exports: [AppLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
