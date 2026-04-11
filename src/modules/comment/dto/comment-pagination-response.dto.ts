import { Expose, Type } from 'class-transformer';
import { CommentResponseDto } from './comment-response.dto';

export class CommentPaginationResponseDto {
  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  @Type(() => CommentResponseDto)
  data: CommentResponseDto[];
}
