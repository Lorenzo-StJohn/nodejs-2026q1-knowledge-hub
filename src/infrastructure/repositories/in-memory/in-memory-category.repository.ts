import { Injectable } from '@nestjs/common';

import type { CategoryInterface } from 'src/domain/entities/category.interface';
import type { CategoryRepository } from 'src/domain/repositories/category.repository.interface';

@Injectable()
export class InMemoryCategoryRepository implements CategoryRepository {
  private categories = new Map<string, CategoryInterface>();

  async create(category: CategoryInterface) {
    this.categories.set(category.id, category);
    return category;
  }

  async findById(id: string) {
    return this.categories.get(id) ?? null;
  }

  async findAll() {
    return [...this.categories.values()];
  }

  async update(id: string, category: CategoryInterface) {
    this.categories.set(id, category);
    return this.categories.get(id);
  }

  async delete(id: string) {
    this.categories.delete(id);
  }
}
