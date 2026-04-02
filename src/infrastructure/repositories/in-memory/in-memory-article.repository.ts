import { Injectable } from '@nestjs/common';

import { ArticleInterface } from 'src/domain/entities/article.interface';
import type { ArticleRepository } from 'src/domain/repositories/article.repository.interface';

@Injectable()
export class InMemoryArticleRepository implements ArticleRepository {
  private articles = new Map<string, ArticleInterface>();

  async create(article: ArticleInterface) {
    this.articles.set(article.id, article);
    return article;
  }

  async findById(id: string) {
    return this.articles.get(id) ?? null;
  }

  async findAll() {
    return [...this.articles.values()];
  }

  async update(id: string, article: ArticleInterface) {
    this.articles.set(id, article);
    return this.articles.get(id);
  }

  async delete(id: string) {
    this.articles.delete(id);
  }
}
