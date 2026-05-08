import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { RagSearchRequestDto } from '../dto/search-query.dto';
import { RerankerService } from './reranker.service';

@Injectable()
export class RetrievalService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
    private readonly rerankerService: RerankerService,
  ) {}

  async search(dto: RagSearchRequestDto) {
    const queryVector = (
      await this.embeddingService.embedTexts([dto.query])
    )[0];
    const results = await this.vectorStore.search(queryVector, dto.limit || 5, {
      articleStatus: dto.articleStatus,
      categoryId: dto.categoryId,
      tags: dto.tags,
    });

    const chunks = results.map((r) => ({
      articleId: r.payload.articleId,
      articleTitle: r.payload.title,
      chunk: r.payload.chunk,
      score: r.score,
    }));

    const reranked = await this.rerankerService.rerank(dto.query, chunks);

    return reranked.map((r) => ({
      articleId: r.articleId,
      articleTitle: r.articleTitle,
      chunk: r.chunk,
      similarity: r.score,
    }));
  }
}
