import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GenerateRequestDto } from './dto/generate-request.dto';
import { GeminiService } from './gemini.service';
import { AiUsageTrackerService } from './ai-usage-tracker.service';

@Controller('ai')
@Throttle({ ai: {} })
export class AiGenerateController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly usageTracker: AiUsageTrackerService,
  ) {}
  @Post('generate')
  async generate(@Body() dto: GenerateRequestDto) {
    const { prompt, maxOutputTokens, temperature } = dto;

    const { text, usage } = await this.geminiService.generate(prompt, {
      maxOutputTokens: maxOutputTokens ?? 512,
      temperature: temperature ?? 0.7,
    });

    this.usageTracker.increment('generate', false, usage);

    return {
      generatedText: text.trim(),
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
