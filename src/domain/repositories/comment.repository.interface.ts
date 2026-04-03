import type { CommentInterface } from '../entities/comment.interface';

export interface CommentRepository {
  findAll(articleId: string): Promise<CommentInterface[]>;
  findById(id: string): Promise<CommentInterface | null>;
  create(user: CommentInterface): Promise<CommentInterface>;
  delete(id: string): Promise<void>;
}

export const COMMENT_REPOSITORY = ' COMMENT_REPOSITORY' as const;
