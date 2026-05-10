import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService, VectorPoint } from './vector-store.service';
import { ArticleService } from 'src/modules/article/article.service';
import { Configuration } from 'src/config/configuration';
import { ReindexRequestDto, ReindexResponseDto } from '../dto/reindex.dto';
import { DEFAULT_LIMIT } from 'src/common/dto/pagination-query.dto';
import { Order } from 'src/common/entities/sort.interface';
import { ArticleResponseDto } from 'src/modules/article/dto/article-response.dto';
import { IndexingStateService } from './indexing-state.service';

const DEFAULT_FIND_ALL_ARTICLES_REQUEST = {
  sortBy: 'createdAt',
  order: Order[0],
  page: 1,
  limit: DEFAULT_LIMIT,
};

@Injectable()
export class IndexingService {
  constructor(
    private readonly articleService: ArticleService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
    private readonly config: Configuration,
    private readonly indexingStateService: IndexingStateService,
  ) {}

  async reindex(dto: ReindexRequestDto): Promise<ReindexResponseDto> {
    const now = new Date();
    const mode = dto.mode || 'full';
    const onlyPublished = dto.onlyPublished ?? true;

    let articles: ArticleResponseDto[] = [];
    if (dto.articleIds && dto.articleIds.length > 0) {
      articles = (
        await this.articleService.findAll(DEFAULT_FIND_ALL_ARTICLES_REQUEST)
      ).data.filter((a) => dto.articleIds!.includes(a.id));
    } else if (mode === 'incremental') {
      const lastFull = await this.indexingStateService.getLastFullIndexAt();
      if (!lastFull) {
        articles = (
          await this.articleService.findAll(DEFAULT_FIND_ALL_ARTICLES_REQUEST)
        ).data;
      } else {
        articles = await this.articleService.findUpdatedAfter(lastFull);
      }
    } else {
      articles = (
        await this.articleService.findAll(DEFAULT_FIND_ALL_ARTICLES_REQUEST)
      ).data;
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

    if (mode === 'full') {
      await this.indexingStateService.updateLastFullIndexAt(now);
    }
    await this.indexingStateService.updateLastIncrementalIndexAt(now);

    return {
      indexedArticles: totalIndexedArticles,
      indexedChunks: totalChunks,
      vectorCollection: this.config.ragVectorCollection,
      mode,
    };
  }
}
