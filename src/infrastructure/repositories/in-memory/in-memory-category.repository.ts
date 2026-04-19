import { Inject, Injectable } from '@nestjs/common';

import type { CategoryInterface } from 'src/domain/entities/category.interface';
import type {
  CategoryFilters,
  CategoryRepository,
} from 'src/domain/repositories/category.repository.interface';
import { Order } from 'src/common/entities/sort.interface';
import {
  ARTICLE_REPOSITORY,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';

@Injectable()
export class InMemoryCategoryRepository implements CategoryRepository {
  private categories = new Map<string, CategoryInterface>();

  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepo: ArticleRepository,
  ) {}

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

    if (sortBy) {
      categories = categories.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];

        if (valA === null) return 1;
        if (valB === null) return -1;

        const isAsc = order === Order[0];

        if (typeof valA !== 'string' || typeof valB !== 'string') {
          return isAsc ? valA - valB : valB - valA;
        }

        if (valA === valB) return 0;

        if (isAsc) {
          return valA > valB ? 1 : -1;
        } else {
          return valB > valA ? 1 : -1;
        }
      });
    }

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
    const articlesByCategory = await this.articleRepo.findByCategoryId(id);
    if (articlesByCategory) {
      articlesByCategory.forEach(async (articleId) => {
        const article = await this.articleRepo.findById(articleId);
        const updatedArticle = { ...article, categoryId: null };
        this.articleRepo.update(articleId, updatedArticle);
      });
    }
    this.categories.delete(id);
  }
}
