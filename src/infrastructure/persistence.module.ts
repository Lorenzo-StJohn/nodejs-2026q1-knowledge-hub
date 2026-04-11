import { Module } from '@nestjs/common';
import { Configuration } from 'src/config/configuration';

import { USER_REPOSITORY } from 'src/domain/repositories/user.repository.interface';
import {
  ARTICLE_REPOSITORY,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import { CATEGORY_REPOSITORY } from 'src/domain/repositories/category.repository.interface';
import {
  COMMENT_REPOSITORY,
  CommentRepository,
} from 'src/domain/repositories/comment.repository.interface';

import { InMemoryUserRepository } from './repositories/in-memory/in-memory-user.repository';
import { InMemoryArticleRepository } from './repositories/in-memory/in-memory-article.repository';
import { InMemoryCategoryRepository } from './repositories/in-memory/in-memory-category.repository';
import { InMemoryCommentRepository } from './repositories/in-memory/in-memory-comment.repository';

import { RealDbUserRepository } from './repositories/real-db/real-db-user.repository';
import { RealDbArticleRepository } from './repositories/real-db/real-db-article.repository';
import { RealDbCategoryRepository } from './repositories/real-db/real-db-category.repository';
import { RealDbCommentRepository } from './repositories/real-db/real-db-comment.repository';

import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [
    Configuration,
    PrismaService,

    {
      provide: USER_REPOSITORY,
      useFactory: (
        config: Configuration,
        prisma: PrismaService,
        articleRepo: ArticleRepository,
        commentRepo: CommentRepository,
      ) => {
        if (config.isMemoryMode) {
          return new InMemoryUserRepository(articleRepo, commentRepo);
        }
        return new RealDbUserRepository(prisma);
      },
      inject: [
        Configuration,
        PrismaService,
        ARTICLE_REPOSITORY,
        COMMENT_REPOSITORY,
      ],
    },

    {
      provide: ARTICLE_REPOSITORY,
      useFactory: (
        config: Configuration,
        prisma: PrismaService,
        commentRepo: CommentRepository,
      ) => {
        if (config.isMemoryMode) {
          return new InMemoryArticleRepository(commentRepo);
        }
        return new RealDbArticleRepository(prisma);
      },
      inject: [Configuration, PrismaService, COMMENT_REPOSITORY],
    },

    {
      provide: CATEGORY_REPOSITORY,
      useFactory: (
        config: Configuration,
        prisma: PrismaService,
        articleRepo: ArticleRepository,
      ) => {
        if (config.isMemoryMode) {
          return new InMemoryCategoryRepository(articleRepo);
        }
        return new RealDbCategoryRepository(prisma);
      },
      inject: [Configuration, PrismaService, ARTICLE_REPOSITORY],
    },

    {
      provide: COMMENT_REPOSITORY,
      useFactory: (config: Configuration, prisma: PrismaService) => {
        if (config.isMemoryMode) {
          return new InMemoryCommentRepository();
        }
        return new RealDbCommentRepository(prisma);
      },
      inject: [Configuration, PrismaService],
    },
  ],

  exports: [
    USER_REPOSITORY,
    ARTICLE_REPOSITORY,
    CATEGORY_REPOSITORY,
    COMMENT_REPOSITORY,
  ],
})
export class PersistenceModule {}
