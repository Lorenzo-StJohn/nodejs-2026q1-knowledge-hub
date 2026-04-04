import { Injectable } from '@nestjs/common';

import type { CategoryInterface } from 'src/domain/entities/category.interface';
import type {
  CategoryFilters,
  CategoryRepository,
} from 'src/domain/repositories/category.repository.interface';
import { Order } from 'src/common/entities/sort.interface';

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

  async findAll(filters: CategoryFilters) {
    const { page, limit, sortBy, order } = filters;

    let categories = [...this.categories.values()];

    const skip = (page - 1) * limit;
    const total = categories.length;

    if (skip >= total) {
      categories = [];
    } else {
      categories = categories.slice(skip, Math.min(total, skip + limit));
    }

    if (sortBy) {
      categories = categories.sort((a, b) => {
        if (a[sortBy] === null) return 1;
        if (b[sortBy] === null) return -1;
        return order === Order[0]
          ? typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number'
            ? a[sortBy] - b[sortBy]
            : a[sortBy].localeCompare(b[sortBy])
          : typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number'
            ? b[sortBy] - a[sortBy]
            : b[sortBy].localeCompare(a[sortBy]);
      });
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
