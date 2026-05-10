import { IsUUID } from 'class-validator';

export class ArticleIdParamDto {
  @IsUUID('4', { message: 'ID should be valid UUID v4' })
  articleId: string;
}
