import { Inject, Injectable } from '@nestjs/common';

import type { UserInterface } from 'src/domain/entities/user.interface';
import type {
  UserFilters,
  UserRepository,
} from 'src/domain/repositories/user.repository.interface';
import { Order } from 'src/common/entities/sort.interface';
import {
  ARTICLE_REPOSITORY,
  ArticleRepository,
} from 'src/domain/repositories/article.repository.interface';
import {
  COMMENT_REPOSITORY,
  CommentRepository,
} from 'src/domain/repositories/comment.repository.interface';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, UserInterface>();

  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepo: ArticleRepository,
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepo: CommentRepository,
  ) {}

  async create(user: UserInterface) {
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string) {
    return this.users.get(id) ?? null;
  }

  async findAll(filters: UserFilters) {
    const { page, limit, sortBy, order } = filters;

    let users = [...this.users.values()];

    if (sortBy) {
      users = users.sort((a, b) => {
        if (a[sortBy] === null) return 1;
        if (b[sortBy] === null) return -1;
        return order === Order[0]
          ? typeof a[sortBy] !== 'string' && typeof b[sortBy] !== 'string'
            ? a[sortBy] - b[sortBy]
            : a[sortBy].localeCompare(b[sortBy])
          : typeof a[sortBy] !== 'string' && typeof b[sortBy] !== 'string'
            ? b[sortBy] - a[sortBy]
            : b[sortBy].localeCompare(a[sortBy]);
      });
    }

    const skip = (page - 1) * limit;
    const total = users.length;

    if (skip >= total) {
      users = [];
    } else {
      users = users.slice(skip, Math.min(total, skip + limit));
    }

    return { total, page, limit, data: users };
  }

  async update(id: string, user: UserInterface) {
    this.users.set(id, user);
    return this.users.get(id);
  }

  async delete(id: string) {
    this.users.delete(id);
    const articlesByUser = await this.articleRepo.findByAuthorId(id);
    if (articlesByUser) {
      articlesByUser.forEach(async (articleId) => {
        const article = await this.articleRepo.findById(articleId);
        const updatedArticle = { ...article, authorId: null };
        await this.articleRepo.update(articleId, updatedArticle);
      });
    }

    const commentsByUser = await this.commentRepo.findByAuthorId(id);
    if (commentsByUser) {
      commentsByUser.forEach(async (commentId) => {
        await this.commentRepo.delete(commentId);
      });
    }
  }
}
