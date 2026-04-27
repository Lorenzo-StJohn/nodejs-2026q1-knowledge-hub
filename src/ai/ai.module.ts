import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GeminiService } from './gemini.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, GeminiService],
})
export class AiModule {}
