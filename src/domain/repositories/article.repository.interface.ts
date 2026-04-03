import { ArticleStatus } from 'src/modules/article/dto/create-article.dto';
import type { ArticleInterface } from '../entities/article.interface';

export interface ArticleFilters {
  status?: ArticleStatus;
  categoryId?: string;
  tag?: string;
}

export interface ArticleRepository {
  findAll(filters: ArticleFilters): Promise<ArticleInterface[]>;
  findById(id: string): Promise<ArticleInterface | null>;
  findByAuthorId(id: string): Promise<Set<string> | null>;
  findByCategoryId(id: string): Promise<Set<string> | null>;
  create(article: ArticleInterface): Promise<ArticleInterface>;
  update(id: string, article: ArticleInterface): Promise<ArticleInterface>;
  delete(id: string): Promise<void>;
}

export const ARTICLE_REPOSITORY = 'ARTICLE_REPOSITORY' as const;
