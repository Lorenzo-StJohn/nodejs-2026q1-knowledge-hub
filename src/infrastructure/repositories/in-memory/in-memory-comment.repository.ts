import { Injectable } from '@nestjs/common';

import type { CommentInterface } from 'src/domain/entities/comment.interface';
import type {
  CommentFilters,
  CommentRepository,
} from 'src/domain/repositories/comment.repository.interface';
import { Order } from 'src/common/entities/sort.interface';

@Injectable()
export class InMemoryCommentRepository implements CommentRepository {
  private comments = new Map<string, CommentInterface>();
  private commentsByArticle = new Map<string, Set<string>>();
  private commentsByAuthorId = new Map<string, Set<string>>();

  async create(comment: CommentInterface) {
    this.comments.set(comment.id, comment);

    const authorId = comment.authorId;
    if (!this.commentsByArticle.has(comment.articleId)) {
      this.commentsByArticle.set(comment.articleId, new Set<string>());
    }
    this.commentsByArticle.get(comment.articleId).add(comment.id);

    if (authorId) {
      if (!this.commentsByAuthorId.has(authorId)) {
        this.commentsByAuthorId.set(authorId, new Set<string>());
      }
      this.commentsByAuthorId.get(authorId).add(comment.id);
    }

    return comment;
  }

  async findById(id: string) {
    return this.comments.get(id) ?? null;
  }

  async findByAuthorId(id: string) {
    return this.commentsByAuthorId.get(id) ?? null;
  }

  async findAll(filters: CommentFilters) {
    const { articleId, page, limit, sortBy, order } = filters;

    let comments: CommentInterface[] = [];
    this.commentsByArticle.get(articleId)?.forEach((commentId) => {
      comments.push(this.comments.get(commentId));
    });

    if (sortBy) {
      comments = comments.sort((a, b) => {
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
    const total = comments.length;

    if (skip >= total) {
      comments = [];
    } else {
      comments = comments.slice(skip, Math.min(total, skip + limit));
    }

    return { total, page, limit, data: comments };
  }

  async delete(id: string) {
    const articleId = this.comments.get(id).articleId;
    this.commentsByArticle.delete(articleId);

    const authorId = this.comments.get(id).authorId;
    if (authorId) {
      this.commentsByAuthorId.get(authorId)?.delete(id);
    }

    this.comments.delete(id);
  }
}
