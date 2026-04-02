import { Module } from '@nestjs/common';

import { Configuration } from 'src/config/configuration';
import { USER_REPOSITORY } from 'src/domain/repositories/user.repository.interface';
import { InMemoryUserRepository } from './repositories/in-memory/in-memory-user.repository';

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
  ],
  exports: [USER_REPOSITORY],
})
export class PersistenceModule {}
