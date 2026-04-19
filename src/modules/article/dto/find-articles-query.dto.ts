import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Order } from 'src/common/entities/sort.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';

export const ArticleFields = [
  'id',
  'title',
  'content',
  'status',
  'authorId',
  'categoryId',
  'createdAt',
  'updatedAt',
];

export class FindArticlesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by article status',
    enum: ArticleStatus,
    example: 'draft',
  })
  @IsOptional()
  @IsEnum(ArticleStatus, {
    message:
      'Status should be one of the following: draft, published, or archived',
  })
  status?: ArticleStatus;

  @ApiPropertyOptional({
    description: 'Filter by categoryId',
    example: 'f3d2f4c6-5376-48df-b4a7-9fe825559db9',
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'CategoryId should be valid UUID v4',
  })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by tag',
    example: 'string',
  })
  @IsOptional()
  @IsString({
    message: 'Each tag in tags should be a string',
  })
  @IsNotEmpty({
    message: 'Each tag in tags should not be empty',
  })
  tag?: string;

  @ApiPropertyOptional({
    description: 'The field to sort by',
    enum: ArticleFields,
    example: 'title',
  })
  @IsOptional()
  @IsIn(ArticleFields)
  sortBy?: (typeof ArticleFields)[number] = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sorting direction',
    enum: Order,
    example: 'DESC',
  })
  @IsOptional()
  @IsIn(Order)
  order?: (typeof Order)[number] = Order[0];
}
