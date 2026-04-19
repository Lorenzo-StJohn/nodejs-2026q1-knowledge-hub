import { Expose, Transform } from 'class-transformer';

export class CommentResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  articleId: string | null;

  @Expose()
  authorId: string | null;

  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.getTime() : value))
  createdAt: number;

  constructor(partial: Partial<CommentResponseDto>) {
    Object.assign(this, partial);
  }
}
