import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Article ID to get comments for',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID('4', {
    message: 'ArticleId should be valid UUID v4',
  })
  articleId: string;

  @ApiPropertyOptional({
    description: 'The field to sort by',
    enum: CommentFields,
    example: 'content',
  })
  @IsOptional()
  @IsIn(CommentFields)
  sortBy?: (typeof CommentFields)[number] = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sorting direction',
    enum: Order,
    example: 'DESC',
  })
  @IsOptional()
  @IsIn(Order)
  order?: (typeof Order)[number] = Order[0];
}
