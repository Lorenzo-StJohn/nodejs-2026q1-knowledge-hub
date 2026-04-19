import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PersistenceModule } from 'src/infrastructure/persistence.module';

@Module({
  imports: [PersistenceModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
