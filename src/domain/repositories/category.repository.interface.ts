import type { FilterInterface } from 'src/common/entities/filter.interface';
import type { CategoryInterface } from '../entities/category.interface';
import type { PaginatedResponse } from 'src/common/entities/paginated-response.interface';

export interface CategoryRepository {
  findAll(
    filters: FilterInterface,
  ): Promise<PaginatedResponse<CategoryInterface>>;
  findById(id: string): Promise<CategoryInterface | null>;
  create(article: CategoryInterface): Promise<CategoryInterface>;
  update(id: string, article: CategoryInterface): Promise<CategoryInterface>;
  delete(id: string): Promise<void>;
}

export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY' as const;
