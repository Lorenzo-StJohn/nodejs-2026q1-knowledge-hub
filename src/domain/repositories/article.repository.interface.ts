import type { ArticleInterface } from '../entities/article.interface';

export interface ArticleRepository {
  findAll(): Promise<ArticleInterface[]>;
  findById(id: string): Promise<ArticleInterface | null>;
  create(article: ArticleInterface): Promise<ArticleInterface>;
  update(id: string, article: ArticleInterface): Promise<ArticleInterface>;
  delete(id: string): Promise<void>;
}

export const ARTICLE_REPOSITORY = 'ARTICLE_REPOSITORY' as const;
