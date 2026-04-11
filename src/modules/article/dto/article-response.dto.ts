import { ArticleStatus } from '@prisma/client';
import { Expose, Transform } from 'class-transformer';

export class ArticleResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  status: ArticleStatus;

  @Expose()
  authorId: string | null;

  @Expose()
  categoryId: string | null;

  @Expose()
  tags: string[];

  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.getTime() : value))
  createdAt: number;

  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.getTime() : value))
  updatedAt: number;

  constructor(partial: Partial<ArticleResponseDto>) {
    Object.assign(this, partial);
  }
}
