import { Injectable } from '@nestjs/common';

import type { CommentInterface } from 'src/domain/entities/comment.interface';
import type { CommentRepository } from 'src/domain/repositories/comment.repository.interface';

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

  async findAll(articleId: string) {
    const results: CommentInterface[] = [];
    this.commentsByArticle.get(articleId)?.forEach((commentId) => {
      results.push(this.comments.get(commentId));
    });
    return results;
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
