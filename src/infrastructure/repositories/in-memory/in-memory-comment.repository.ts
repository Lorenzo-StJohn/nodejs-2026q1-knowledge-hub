import { Injectable } from '@nestjs/common';

import type { CommentInterface } from 'src/domain/entities/comment.interface';
import type { CommentRepository } from 'src/domain/repositories/comment.repository.interface';

@Injectable()
export class InMemoryCommentRepository implements CommentRepository {
  private comments = new Map<string, CommentInterface>();
  private commentsByArticle = new Map<string, Set<string>>();

  async create(comment: CommentInterface) {
    this.comments.set(comment.id, comment);
    if (!this.commentsByArticle.has(comment.articleId)) {
      this.commentsByArticle.set(comment.articleId, new Set<string>());
    }
    this.commentsByArticle.get(comment.articleId).add(comment.id);
    return comment;
  }

  async findById(id: string) {
    return this.comments.get(id) ?? null;
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
    this.comments.delete(id);
  }
}
