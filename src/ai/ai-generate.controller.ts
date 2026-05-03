import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GenerateRequestDto } from './dto/generate-request.dto';
import { GeminiService } from './gemini.service';
import { AiUsageTrackerService } from './ai-usage-tracker.service';
import { AppLogger } from 'src/common/logger/logger.service';
import { ConversationService } from './services/conversation.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenerateResponseDto } from './dto/generate-response.dto';

@ApiTags('AI - Generate')
@Controller('ai')
@Throttle({ ai: {} })
export class AiGenerateController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly usageTracker: AiUsageTrackerService,
    private readonly logger: AppLogger,
    private readonly conversationService: ConversationService,
  ) {}
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Free-form AI text generation with optional session context',
  })
  @ApiBody({ type: GenerateRequestDto })
  @ApiOkResponse({
    description: 'Text generated successfully',
    type: GenerateResponseDto,
  })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async generate(@Body() dto: GenerateRequestDto) {
    const { prompt, maxOutputTokens, temperature, sessionId, clearSession } =
      dto;

    if (sessionId && clearSession) {
      this.conversationService.clearSession(sessionId);
    }
    const history = sessionId
      ? this.conversationService.getHistory(sessionId)
      : [];
    const start = performance.now();

    const { text, usage } = sessionId
      ? await this.geminiService.generateWithContext(history, prompt, {
          maxOutputTokens: maxOutputTokens ?? 512,
          temperature: temperature ?? 0.7,
        })
      : await this.geminiService.generate(prompt, {
          maxOutputTokens: maxOutputTokens ?? 512,
          temperature: temperature ?? 0.7,
        });

    const latencyMs = performance.now() - start;
    if (latencyMs > 5000) {
      this.logger.warn(
        `Slow AI request: generate took ${latencyMs.toFixed(0)}ms`,
      );
    }
    if (sessionId) {
      this.conversationService.addMessage(sessionId, 'user', prompt);
      this.conversationService.addMessage(sessionId, 'model', text.trim());
    }

    this.usageTracker.increment('generate', false, usage, latencyMs);

    return {
      generatedText: text.trim(),
      sessionId: sessionId || undefined,
      usage: usage
        ? {
            promptTokens: usage.promptTokenCount,
            completionTokens: usage.candidatesTokenCount,
            totalTokens: usage.totalTokenCount,
          }
        : undefined,
    };
  }
}
