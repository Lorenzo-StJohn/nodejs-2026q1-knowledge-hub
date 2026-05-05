import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService, VectorPoint } from './vector-store.service';
import { ArticleService } from 'src/modules/article/article.service';
import { Configuration } from 'src/config/configuration';
import { ReindexRequestDto, ReindexResponseDto } from '../dto/reindex.dto';

@Injectable()
export class IndexingService {
  constructor(
    private readonly articleService: ArticleService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
    private readonly config: Configuration,
  ) {}

  async reindex(dto: ReindexRequestDto): Promise<ReindexResponseDto> {
    const onlyPublished = dto.onlyPublished ?? true;
    let articles = (await this.articleService.findAll({})).data;
    if (dto.articleIds && dto.articleIds.length > 0) {
      articles = articles.filter((a) => dto.articleIds!.includes(a.id));
    }
    if (onlyPublished) {
      articles = articles.filter((a) => a.status === 'published');
    }

    let totalIndexedArticles = 0;
    let totalChunks = 0;

    for (const article of articles) {
      await this.vectorStore.deleteByArticleId(article.id);

      const chunks = this.chunkingService.splitText(article.content);
      if (chunks.length === 0) continue;

      const texts = chunks.map((c) => c.text);
      const embeddings = await this.embeddingService.embedTexts(texts);

      const points: VectorPoint[] = chunks.map((chunk, idx) => ({
        id: uuidv4(),
        vector: embeddings[idx],
        payload: {
          articleId: article.id,
          title: article.title,
          chunk: chunk.text,
          chunkIndex: chunk.index,
          status: article.status,
          categoryId: article.categoryId || undefined,
          tags: article.tags || [],
        },
      }));

      await this.vectorStore.upsert(points);
      totalIndexedArticles++;
      totalChunks += chunks.length;
    }

    return {
      indexedArticles: totalIndexedArticles,
      indexedChunks: totalChunks,
      vectorCollection: this.config.ragVectorCollection,
    };
  }
}
