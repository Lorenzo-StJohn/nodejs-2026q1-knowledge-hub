import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GeminiService } from './gemini.service';
import { ConfigModule } from '../config/config.module';
import { OutgoingLoggingInterceptor } from 'src/common/interceptors/outgoing-logging.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [AiController],
  providers: [AiService, GeminiService, OutgoingLoggingInterceptor],
})
export class AiModule {}
