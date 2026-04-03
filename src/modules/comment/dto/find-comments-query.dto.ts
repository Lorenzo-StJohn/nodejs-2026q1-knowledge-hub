import { IsUUID } from 'class-validator';

export class FindCommentsQueryDto {
  @IsUUID('4', {
    message: 'ArticleId should be valid UUID v4',
  })
  articleId: string;
}
