import { Injectable } from '@nestjs/common';

import type { ArticleInterface } from 'src/domain/entities/article.interface';
import type {
  ArticleFilters,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';

@Injectable()
export class InMemoryArticleRepository implements ArticleRepository {
  private articles = new Map<string, ArticleInterface>();
  private articlesByUser = new Map<string, Set<string>>();
  private articlesByCategory = new Map<string, Set<string>>();

  async create(article: ArticleInterface) {
    this.articles.set(article.id, article);

    const authorId = article.authorId;
    if (authorId) {
      if (!this.articlesByUser.has(authorId)) {
        this.articlesByUser.set(authorId, new Set<string>());
      }
      this.articlesByUser.get(authorId).add(article.id);
    }

    const categoryId = article.categoryId;
    if (categoryId) {
      if (!this.articlesByCategory.has(categoryId)) {
        this.articlesByCategory.set(categoryId, new Set<string>());
      }
      this.articlesByCategory.get(categoryId).add(article.id);
    }

    return article;
  }

  async findById(id: string) {
    return this.articles.get(id) ?? null;
  }

  async findByAuthorId(id: string) {
    return this.articlesByUser.get(id) ?? null;
  }

  async findByCategoryId(id: string) {
    return this.articlesByCategory.get(id) ?? null;
  }

  async findAll(filters: ArticleFilters) {
    const { status, tag, categoryId } = filters;
    let articles = [...this.articles.values()];

    if (status) {
      articles = articles.filter((article) => article.status === status);
    }

    if (tag) {
      articles = articles.filter((article) => article.tags.includes(tag));
    }

    if (categoryId) {
      articles = articles.filter(
        (article) => article.categoryId === categoryId,
      );
    }

    return articles;
  }

  async update(id: string, article: ArticleInterface) {
    const oldAuthorId = this.articles.get(id).authorId;
    const newAuthorId = article.authorId;

    if (oldAuthorId !== newAuthorId) {
      if (oldAuthorId) {
        this.articlesByUser.get(oldAuthorId).delete(id);
      }
      if (newAuthorId) {
        if (!this.articlesByUser.has(newAuthorId)) {
          this.articlesByUser.set(newAuthorId, new Set<string>());
        }
        this.articlesByUser.get(newAuthorId).add(article.id);
      }
    }

    const oldCategoryId = this.articles.get(id).categoryId;
    const newCategoryId = article.categoryId;

    if (oldCategoryId !== newCategoryId) {
      if (oldCategoryId) {
        this.articlesByCategory.get(oldCategoryId).delete(id);
      }
      if (newAuthorId) {
        if (!this.articlesByCategory.has(newCategoryId)) {
          this.articlesByCategory.set(newCategoryId, new Set<string>());
        }
        this.articlesByCategory.get(newCategoryId).add(article.id);
      }
    }

    this.articles.set(id, article);
    return this.articles.get(id);
  }

  async delete(id: string) {
    const authorId = this.articles.get(id).authorId;
    if (authorId) {
      this.articlesByUser.get(authorId).delete(id);
    }

    const categoryId = this.articles.get(id).categoryId;
    if (categoryId) {
      this.articlesByCategory.get(categoryId).delete(id);
    }
    this.articles.delete(id);
  }
}
