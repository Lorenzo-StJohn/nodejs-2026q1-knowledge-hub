import { Expose, Type } from 'class-transformer';
import { ArticleResponseDto } from './article-response.dto';

export class ArticlePaginationResponseDto {
  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  @Type(() => ArticleResponseDto)
  data: ArticleResponseDto[];
}
