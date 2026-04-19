import { ArticleStatus } from '@prisma/client';

export interface ArticleInterface {
  id: string;
  title: string;
  content: string;
  status: ArticleStatus;
  authorId: string | null;
  categoryId: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
