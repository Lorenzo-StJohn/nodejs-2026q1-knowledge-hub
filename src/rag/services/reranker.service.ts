import { Injectable } from '@nestjs/common';
import { GeminiService } from '../../ai/gemini.service';
import { sleep } from '../../common/utils/sleep.util';
import { Configuration } from 'src/config/configuration';

export interface ScoredChunk {
  articleId: string;
  articleTitle: string;
  chunk: string;
  score: number;
}

@Injectable()
export class RerankerService {
  private readonly enabled: boolean;
  private readonly topK: number;
  private readonly weight: number;

  constructor(
    private readonly config: Configuration,
    private readonly geminiService: GeminiService,
  ) {
    this.enabled = this.config.ragRerankEnabled;
    this.topK = +this.config.ragRerankTopK;
    this.weight = +this.config.ragRerankWeight;
  }

  async rerank(query: string, chunks: ScoredChunk[]): Promise<ScoredChunk[]> {
    if (!this.enabled || chunks.length === 0) {
      return chunks;
    }

    const toRerank = chunks.slice(0, this.topK);
    const rest = chunks.slice(this.topK);

    const scores = await this.getRelevanceScores(query, toRerank);

    const reranked = toRerank.map((chunk, idx) => {
      const geminiScore = scores[idx];
      const combinedScore =
        this.weight * geminiScore + (1 - this.weight) * chunk.score;
      return { ...chunk, score: combinedScore };
    });

    const sorted = reranked.sort((a, b) => b.score - a.score);
    return [...sorted, ...rest];
  }

  private async getRelevanceScores(
    query: string,
    chunks: ScoredChunk[],
  ): Promise<number[]> {
    const maxConcurrency = 5;
    const results: number[] = [];

    for (let i = 0; i < chunks.length; i += maxConcurrency) {
      const batch = chunks.slice(i, i + maxConcurrency);
      const batchScores = await Promise.all(
        batch.map((c) => this.scoreSingleChunk(query, c.chunk)),
      );
      results.push(...batchScores);

      if (i + maxConcurrency < chunks.length) {
        await sleep(500);
      }
    }

    return results;
  }

  private async scoreSingleChunk(
    query: string,
    chunkText: string,
  ): Promise<number> {
    const truncated = chunkText.substring(0, 1500);

    const prompt = `On a scale of 1 to 10, rate the relevance of the following text to the query: "${query}". Return ONLY the number, no other text.\n\nText: "${truncated}"`;

    try {
      const { text } = await this.geminiService.generate(prompt, {
        temperature: 0,
        maxOutputTokens: 2,
      });

      const num = parseInt(text.trim(), 10);
      if (isNaN(num) || num < 1 || num > 10) {
        return 0.5;
      }
      return num / 10;
    } catch (error) {
      return 0.5;
    }
  }
}
