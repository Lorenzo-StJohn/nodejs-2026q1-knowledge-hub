export const ArticleStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export interface ArticleInterface {
  id: string;
  title: string;
  content: string;
  status: (typeof ArticleStatus)[keyof typeof ArticleStatus];
  authorId: string | null;
  categoryId: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
