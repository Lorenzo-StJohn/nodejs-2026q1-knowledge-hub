import {
  Controller,
  Post,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GeminiService } from './gemini.service';
import { SummarizeArticleRequestDto } from './dto/summarize-article.dto';
import { TranslateArticleRequestDto } from './dto/translate-article.dto';
import { AnalyzeArticleRequestDto } from './dto/analyze-article.dto';
import { summarizeArticlePrompt } from './prompt-templates/summarize.template';
import { translateArticlePrompt } from './prompt-templates/translate.template';
import { analyzeArticlePrompt } from './prompt-templates/analyze.template';
import { ArticleService } from 'src/modules/article/article.service';
import { AiCacheService } from './ai-cache.service';
import { AiUsageTrackerService } from './ai-usage-tracker.service';
import { parseStructuredResponse } from './utils/parse-structured-response';
import {
  translateResponseSchema,
  analyzeResponseSchema,
  TranslateResponse,
  AnalyzeResponse,
} from './schemas/ai-response.schemas';
import { AppLogger } from 'src/common/logger/logger.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SummarizeArticleResponseDto } from './dto/summarize-response.dto';
import { TranslateArticleResponseDto } from './dto/translate-response.dto';
import { AnalyzeArticleResponseDto } from './dto/analyze-response.dto';

const LIMIT = parseInt(process.env.AI_RATE_LIMIT_RPM || '20', 10);

@ApiTags('AI - Articles')
@Controller('ai/articles')
@Throttle({ ai: { limit: LIMIT, ttl: 60000 } })
export class AiController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly geminiService: GeminiService,
    private readonly cacheService: AiCacheService,
    private readonly usageTracker: AiUsageTrackerService,
    private readonly logger: AppLogger,
  ) {}

  @Post(':articleId/summarize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Summarize an article' })
  @ApiParam({ name: 'articleId', description: 'The ID of the article' })
  @ApiBody({ type: SummarizeArticleRequestDto })
  @ApiOkResponse({
    description: 'Article summarized successfully',
    type: SummarizeArticleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async summarize(
    @Param('articleId') articleId: string,
    @Body() dto: SummarizeArticleRequestDto,
  ) {
    const article = await this.articleService.findOne(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const cacheKey = `summarize:${articleId}:${dto.maxLength}:${article.updatedAt.toString()}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.usageTracker.increment('summarize', true, undefined, 0);
      return cached;
    }
    const prompt = summarizeArticlePrompt(article.content, dto.maxLength);
    const start = performance.now();
    const { text, usage } = await this.geminiService.generate(prompt, {
      maxOutputTokens:
        dto.maxLength === 'short'
          ? 100
          : dto.maxLength === 'detailed'
            ? 500
            : 250,
    });

    const latencyMs = performance.now() - start;
    if (latencyMs > 5000) {
      this.logger.warn(
        `Slow AI request: summarize took ${latencyMs.toFixed(0)}ms`,
      );
    }

    const response = {
      articleId,
      summary: text.trim(),
      originalLength: article.content.length,
      summaryLength: text.trim().length,
    };

    await this.cacheService.set(cacheKey, response);
    this.usageTracker.increment('summarize', false, usage, latencyMs);

    return response;
  }

  @Post(':articleId/translate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Translate an article' })
  @ApiParam({ name: 'articleId', description: 'The ID of the article' })
  @ApiBody({ type: TranslateArticleRequestDto })
  @ApiOkResponse({
    description: 'Article translated successfully',
    type: TranslateArticleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiBadRequestResponse({ description: 'targetLanguage is required' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async translate(
    @Param('articleId') articleId: string,
    @Body() dto: TranslateArticleRequestDto,
  ) {
    if (!dto.targetLanguage) {
      throw new BadRequestException('targetLanguage is required');
    }

    const article = await this.articleService.findOne(articleId);
    if (!article) throw new NotFoundException('Article not found');

    const cacheKey = `translate:${articleId}:${dto.targetLanguage}:${dto.sourceLanguage ?? 'auto'}:${article.updatedAt.toString()}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.usageTracker.increment('translate', true, undefined, 0);
      return cached;
    }

    const prompt = translateArticlePrompt(
      article.content,
      dto.targetLanguage,
      dto.sourceLanguage,
    );
    const start = performance.now();
    const { text, usage } = await this.geminiService.generate(prompt);
    const latencyMs = performance.now() - start;
    if (latencyMs > 5000) {
      this.logger.warn(
        `Slow AI request: translate took ${latencyMs.toFixed(0)}ms`,
      );
    }

    // Structured validation with fallback
    const fallback: TranslateResponse = {
      translatedText: text.trim(),
      detectedLanguage: dto.sourceLanguage || 'unknown',
    };

    const validated = parseStructuredResponse(
      text,
      translateResponseSchema,
      fallback,
      this.logger,
    );

    const response = {
      articleId,
      translatedText: validated.translatedText,
      detectedLanguage: validated.detectedLanguage,
    };

    await this.cacheService.set(cacheKey, response);
    this.usageTracker.increment('translate', false, usage, latencyMs);
    return response;
  }

  @Post(':articleId/analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze article content' })
  @ApiParam({ name: 'articleId', description: 'The ID of the article' })
  @ApiBody({ type: AnalyzeArticleRequestDto })
  @ApiOkResponse({
    description: 'Article analyzed successfully',
    type: AnalyzeArticleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async analyze(
    @Param('articleId') articleId: string,
    @Body() dto: AnalyzeArticleRequestDto,
  ) {
    const article = await this.articleService.findOne(articleId);
    if (!article) throw new NotFoundException('Article not found');

    const prompt = analyzeArticlePrompt(article.content, dto.task);
    const start = performance.now();
    const { text, usage } = await this.geminiService.generate(prompt, {
      temperature: 0.2,
    });
    const latencyMs = performance.now() - start;
    if (latencyMs > 5000) {
      this.logger.warn(
        `Slow AI request: analyze took ${latencyMs.toFixed(0)}ms`,
      );
    }

    // Structured validation with fallback
    const fallback: AnalyzeResponse = {
      analysis: text,
      suggestions: [],
      severity: 'info',
    };

    const validated = parseStructuredResponse(
      text,
      analyzeResponseSchema,
      fallback,
      this.logger,
    );

    const response = {
      articleId,
      analysis: validated.analysis,
      suggestions: validated.suggestions,
      severity: validated.severity,
    };

    this.usageTracker.increment('analyze', false, usage, latencyMs);
    return response;
  }
}
