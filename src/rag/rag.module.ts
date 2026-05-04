import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [],
})
export class RagModule {}
