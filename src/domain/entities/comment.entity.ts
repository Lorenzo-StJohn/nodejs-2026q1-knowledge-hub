import { randomUUID } from 'node:crypto';

import type { CreateCommentDto } from 'src/modules/comment/dto/create-comment.dto';
import type { CommentInterface } from './comment.interface';

export class Comment implements CommentInterface {
  public readonly id: string;
  public content: string;
  public articleId: string;
  public authorId: string | null;
  public readonly createdAt: number;

  constructor(createComment: CreateCommentDto) {
    const timestamp = Date.now();
    this.id = randomUUID();
    this.content = createComment.content;
    this.articleId = createComment.articleId;
    this.authorId = createComment.authorId ?? null;
    this.createdAt = timestamp;
  }
}
