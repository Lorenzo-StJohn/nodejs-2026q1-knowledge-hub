import { IsIn, IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Order } from 'src/common/entities/sort.interface';

export const CommentFields = [
  'id',
  'content',
  'authorId',
  'articleId',
  'createdAt',
];

export class FindCommentQueryDto extends PaginationQueryDto {
  @IsUUID('4', {
    message: 'ArticleId should be valid UUID v4',
  })
  articleId: string;

  @IsOptional()
  @IsIn(CommentFields)
  sortBy?: (typeof CommentFields)[number];

  @IsOptional()
  @IsIn(Order)
  order?: (typeof Order)[number] = Order[0];
}
