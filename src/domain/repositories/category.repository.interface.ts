import { CategoryInterface } from '../entities/category.interface';

export interface CategoryRepository {
  findAll(): Promise<CategoryInterface[]>;
  findById(id: string): Promise<CategoryInterface | null>;
  create(article: CategoryInterface): Promise<CategoryInterface>;
  update(id: string, article: CategoryInterface): Promise<CategoryInterface>;
  delete(id: string): Promise<void>;
}

export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY' as const;
