import {
  Controller,
  Post,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { SummarizeArticleRequestDto } from './dto/summarize-article.dto';
import { TranslateArticleRequestDto } from './dto/translate-article.dto';
import { AnalyzeArticleRequestDto } from './dto/analyze-article.dto';
import { summarizeArticlePrompt } from './prompt-templates/summarize.template';
import { translateArticlePrompt } from './prompt-templates/translate.template';
import { analyzeArticlePrompt } from './prompt-templates/analyze.template';
import { Throttle } from '@nestjs/throttler';
import { ArticleService } from 'src/modules/article/article.service';
import { AiCacheService } from './ai-cache.service';
import { AiUsageTrackerService } from './ai-usage-tracker.service';

const LIMIT = parseInt(process.env.AI_RATE_LIMIT_RPM || '20', 10);

@Controller('ai/articles')
@Throttle({ ai: { limit: LIMIT, ttl: 60000 } })
export class AiController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly geminiService: GeminiService,
    private readonly cacheService: AiCacheService,
    private readonly usageTracker: AiUsageTrackerService,
  ) {}

  @Post(':articleId/summarize')
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
      this.usageTracker.increment('summarize', true);
      return cached;
    }

    const prompt = summarizeArticlePrompt(article.content, dto.maxLength);
    const { text, usage } = await this.geminiService.generate(prompt, {
      maxOutputTokens:
        dto.maxLength === 'short'
          ? 100
          : dto.maxLength === 'detailed'
            ? 500
            : 250,
    });

    const response = {
      articleId,
      summary: text.trim(),
      originalLength: article.content.length,
      summaryLength: text.trim().length,
    };

    await this.cacheService.set(cacheKey, response);
    this.usageTracker.increment('summarize', false, usage);

    return response;
  }

  @Post(':articleId/translate')
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
      this.usageTracker.increment('translate', true);
      return cached;
    }

    const prompt = translateArticlePrompt(
      article.content,
      dto.targetLanguage,
      dto.sourceLanguage,
    );
    const { text, usage } = await this.geminiService.generate(prompt);

    let translatedText: string;
    let detectedLanguage: string;
    try {
      const parsed = JSON.parse(text);
      translatedText = parsed.translatedText;
      detectedLanguage =
        parsed.detectedLanguage || dto.sourceLanguage || 'unknown';
    } catch {
      translatedText = text.trim();
      detectedLanguage = dto.sourceLanguage || 'unknown';
    }

    const response = { articleId, translatedText, detectedLanguage };
    await this.cacheService.set(cacheKey, response);
    this.usageTracker.increment('translate', false, usage);
    return response;
  }

  @Post(':articleId/analyze')
  async analyze(
    @Param('articleId') articleId: string,
    @Body() dto: AnalyzeArticleRequestDto,
  ) {
    const article = await this.articleService.findOne(articleId);
    if (!article) throw new NotFoundException('Article not found');

    const prompt = analyzeArticlePrompt(article.content, dto.task);
    const { text, usage } = await this.geminiService.generate(prompt, {
      temperature: 0.2,
    });

    let analysis: string;
    let suggestions: string[];
    let severity: 'info' | 'warning' | 'error';
    try {
      const parsed = JSON.parse(text);
      analysis = parsed.analysis ?? '';
      suggestions = parsed.suggestions ?? [];
      severity = parsed.severity ?? 'info';
    } catch {
      analysis = text;
      suggestions = [];
      severity = 'info';
    }

    const response = { articleId, analysis, suggestions, severity };
    this.usageTracker.increment('analyze', false, usage);
    return response;
  }
}
