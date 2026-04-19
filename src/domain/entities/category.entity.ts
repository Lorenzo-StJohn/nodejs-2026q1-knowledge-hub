import { randomUUID } from 'node:crypto';

import type { CreateCategoryDto } from 'src/modules/category/dto/create-category.dto';
import type { CategoryInterface } from './category.interface';
import type { UpdateCategoryDto } from 'src/modules/category/dto/update-category.dto';

export class Category implements CategoryInterface {
  public readonly id: string;
  public name: string;
  public description: string;

  constructor(createCategory: CreateCategoryDto) {
    this.id = randomUUID();
    this.name = createCategory.name;
    this.description = createCategory.description;
  }

  public static update(
    category: CategoryInterface,
    updatedInfo: UpdateCategoryDto,
  ) {
    return { ...category, ...updatedInfo };
  }
}
