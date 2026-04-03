import { ArticleStatus } from 'src/modules/article/dto/create-article.dto';
import type { ArticleInterface } from '../entities/article.interface';
import type { FilterInterface } from 'src/common/entities/filter.interface';
import type { PaginatedResponse } from 'src/common/entities/paginated-response.interface';
import { SortInterface } from 'src/common/entities/sort.interface';
import { ArticleFields } from 'src/modules/article/dto/find-articles-query.dto';

export interface ArticleFilters
  extends FilterInterface,
    SortInterface<typeof ArticleFields> {
  status?: ArticleStatus;
  categoryId?: string;
  tag?: string;
}

export interface ArticleRepository {
  findAll(
    filters: ArticleFilters,
  ): Promise<PaginatedResponse<ArticleInterface>>;
  findById(id: string): Promise<ArticleInterface | null>;
  findByAuthorId(id: string): Promise<Set<string> | null>;
  findByCategoryId(id: string): Promise<Set<string> | null>;
  create(article: ArticleInterface): Promise<ArticleInterface>;
  update(id: string, article: ArticleInterface): Promise<ArticleInterface>;
  delete(id: string): Promise<void>;
}

export const ARTICLE_REPOSITORY = 'ARTICLE_REPOSITORY' as const;
