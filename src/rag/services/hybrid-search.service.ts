import { Injectable } from '@nestjs/common';
import { RetrievalService } from './retrieval.service';
import { ArticleService } from '../../modules/article/article.service';
import { VectorStoreService } from './vector-store.service';

export interface SearchResult {
  articleId: string;
  articleTitle: string;
  chunk: string;
  similarity: number;
}

@Injectable()
export class HybridSearchService {
  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly articleService: ArticleService,
    private readonly vectorStore: VectorStoreService,
  ) {}

  async search(
    query: string,
    limit: number = 5,
    filters?: { articleStatus?: string; categoryId?: string; tags?: string[] },
  ): Promise<SearchResult[]> {
    const semanticResults = await this.retrievalService.search({
      query,
      limit: limit * 2,
      articleStatus: filters?.articleStatus,
      categoryId: filters?.categoryId,
      tags: filters?.tags,
    });

    const lexicalArticles = await this.articleService.searchByQuery(query);

    const lexicalChunks: SearchResult[] = [];
    for (const la of lexicalArticles) {
      const existingChunk = semanticResults.find(
        (r) => r.articleId === la.articleId,
      );
      if (existingChunk) {
        lexicalChunks.push({ ...existingChunk, similarity: la.score });
      } else {
        const dummyVector = new Array(3072).fill(0);
        const filtersForArticle = {
          articleStatus: filters?.articleStatus,
          categoryId: filters?.categoryId,
          tags: filters?.tags,
        };
        const points = await this.vectorStore.search(dummyVector, 1, {
          ...filtersForArticle,
          articleId: la.articleId,
        });
        if (points.length > 0) {
          const p = points[0];
          lexicalChunks.push({
            articleId: p.payload.articleId,
            articleTitle: p.payload.title,
            chunk: p.payload.chunk,
            similarity: la.score,
          });
        } else {
          const article = await this.articleService.findOne(la.articleId);
          if (article) {
            lexicalChunks.push({
              articleId: article.id,
              articleTitle: article.title,
              chunk: article.content.substring(0, 500),
              similarity: la.score,
            });
          }
        }
      }
    }

    const k = 60;
    const allResults = new Map<string, SearchResult & { rrfScore: number }>();

    semanticResults.forEach((res, rank) => {
      const rrf = 1 / (k + rank + 1);
      if (!allResults.has(res.articleId)) {
        allResults.set(res.articleId, { ...res, rrfScore: rrf });
      } else {
        allResults.get(res.articleId)!.rrfScore += rrf;
      }
    });

    lexicalChunks.forEach((res, rank) => {
      const rrf = 1 / (k + rank + 1);
      const existing = allResults.get(res.articleId);
      if (existing) {
        existing.rrfScore += rrf;
      } else {
        allResults.set(res.articleId, { ...res, rrfScore: rrf });
      }
    });
    const sorted = Array.from(allResults.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .slice(0, limit);

    return sorted.map(({ rrfScore, ...rest }) => ({
      ...rest,
      similarity: Math.round(rrfScore * 1000) / 1000,
    }));
  }
}
