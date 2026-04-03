import { Injectable } from '@nestjs/common';
import { FilterInterface } from 'src/common/entities/filter.interface';

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

  async findAll(filters: FilterInterface) {
    const { page, limit } = filters;

    let categories = [...this.categories.values()];

    const skip = (page - 1) * limit;
    const total = categories.length;

    if (skip >= total) {
      categories = [];
    } else {
      categories = categories.slice(skip, Math.min(total, skip + limit));
    }

    return { total, page, limit, data: categories };
  }

  async update(id: string, category: CategoryInterface) {
    this.categories.set(id, category);
    return this.categories.get(id);
  }

  async delete(id: string) {
    this.categories.delete(id);
  }
}
