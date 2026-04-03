import { Injectable } from '@nestjs/common';

import type { ArticleInterface } from 'src/domain/entities/article.interface';
import type { ArticleRepository } from 'src/domain/repositories/article.repository.interface';

@Injectable()
export class InMemoryArticleRepository implements ArticleRepository {
  private articles = new Map<string, ArticleInterface>();
  private articlesByUser = new Map<string, Set<string>>();

  async create(article: ArticleInterface) {
    this.articles.set(article.id, article);
    const authorId = article.authorId;
    if (authorId) {
      if (!this.articlesByUser.has(authorId)) {
        this.articlesByUser.set(authorId, new Set<string>());
      }
      this.articlesByUser.get(authorId).add(article.id);
    }
    return article;
  }

  async findById(id: string) {
    return this.articles.get(id) ?? null;
  }

  async findByAuthorId(id: string) {
    return this.articlesByUser.get(id) ?? null;
  }

  async findAll() {
    return [...this.articles.values()];
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

    this.articles.set(id, article);
    return this.articles.get(id);
  }

  async delete(id: string) {
    const authorId = this.articles.get(id).authorId;
    if (authorId) {
      this.articlesByUser.get(authorId).delete(id);
    }
    this.articles.delete(id);
  }
}
