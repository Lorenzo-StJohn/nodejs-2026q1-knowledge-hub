import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { RagSearchRequestDto } from '../dto/search-query.dto';

@Injectable()
export class RetrievalService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
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

    return results.map((r) => ({
      articleId: r.payload.articleId,
      articleTitle: r.payload.title,
      chunk: r.payload.chunk,
      similarity: r.score,
    }));
  }
}
