import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { UserModule } from './modules/user/user.module';
import { PersistenceModule } from './infrastructure/persistence.module';

@Module({
  imports: [ConfigModule, UserModule, PersistenceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
