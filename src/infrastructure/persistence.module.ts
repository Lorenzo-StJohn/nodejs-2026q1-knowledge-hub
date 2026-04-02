import { Module } from '@nestjs/common';

import { Configuration } from 'src/config/configuration';
import { USER_REPOSITORY } from 'src/domain/repositories/user.repository.interface';
import { InMemoryUserRepository } from './repositories/in-memory/in-memory-user.repository';
import { ARTICLE_REPOSITORY } from 'src/domain/repositories/article.repository.interface';
import { InMemoryArticleRepository } from './repositories/in-memory/in-memory-article.repository';

@Module({
  providers: [
    Configuration,
    {
      provide: USER_REPOSITORY,
      useFactory: (config: Configuration) => {
        if (config.isMemoryMode) {
          return new InMemoryUserRepository();
        }
        //will be replaced with real db repository in the next task
        return new InMemoryUserRepository();
      },
      inject: [Configuration],
    },
    {
      provide: ARTICLE_REPOSITORY,
      useFactory: (config: Configuration) => {
        if (config.isMemoryMode) {
          return new InMemoryArticleRepository();
        }
        //will be replaced with real db repository in the next task
        return new InMemoryArticleRepository();
      },
      inject: [Configuration],
    },
  ],
  exports: [USER_REPOSITORY, ARTICLE_REPOSITORY],
})
export class PersistenceModule {}
