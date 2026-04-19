export interface CommentInterface {
  id: string;
  content: string;
  articleId: string;
  authorId: string | null;
  createdAt: Date;
}
