import { Module } from '@nestjs/common';

import { Configuration } from 'src/config/configuration';

import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/domain/repositories/user.repository.interface';
import {
  ARTICLE_REPOSITORY,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from 'src/domain/repositories/category.repository.interface';
import {
  COMMENT_REPOSITORY,
  CommentRepository,
} from 'src/domain/repositories/comment.repository.interface';

import { InMemoryUserRepository } from './repositories/in-memory/in-memory-user.repository';
import { InMemoryArticleRepository } from './repositories/in-memory/in-memory-article.repository';
import { InMemoryCategoryRepository } from './repositories/in-memory/in-memory-category.repository';
import { InMemoryCommentRepository } from './repositories/in-memory/in-memory-comment.repository';

const createRepository = <T>(
  config: Configuration,
  memoryRepo: new () => T,
  //realRepo: new () => T,
): T => {
  if (config.isMemoryMode) {
    return new memoryRepo();
  }
  // return new realRepo();
  return new memoryRepo();
};

@Module({
  providers: [
    Configuration,
    {
      provide: USER_REPOSITORY,
      useFactory: (config: Configuration) =>
        createRepository<UserRepository>(config, InMemoryUserRepository),
      inject: [Configuration],
    },
    {
      provide: ARTICLE_REPOSITORY,
      useFactory: (config: Configuration) =>
        createRepository<ArticleRepository>(config, InMemoryArticleRepository),
      inject: [Configuration],
    },
    {
      provide: CATEGORY_REPOSITORY,
      useFactory: (config: Configuration) =>
        createRepository<CategoryRepository>(
          config,
          InMemoryCategoryRepository,
        ),
      inject: [Configuration],
    },
    {
      provide: COMMENT_REPOSITORY,
      useFactory: (config: Configuration) =>
        createRepository<CommentRepository>(config, InMemoryCommentRepository),
      inject: [Configuration],
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
