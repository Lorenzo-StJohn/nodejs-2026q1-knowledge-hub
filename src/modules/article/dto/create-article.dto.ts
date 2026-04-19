import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ example: 'string' })
  @IsString({ message: 'Title should be a string' })
  @IsNotEmpty({ message: 'Title should not be empty' })
  title: string;

  @ApiProperty({ example: 'string' })
  @IsString({ message: 'Content should be a string' })
  @IsNotEmpty({ message: 'Content should not be empty' })
  content: string;

  @ApiPropertyOptional({
    description: 'Article status',
    enum: ArticleStatus,
    example: 'draft',
  })
  @IsOptional()
  @IsEnum(ArticleStatus, {
    message:
      'Status should be one of the following: draft, published, or archived',
  })
  status?: ArticleStatus;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @ValidateIf((obj) => obj.authorId !== null)
  @IsUUID('4', {
    message: 'AuthorId should be valid UUID v4',
  })
  authorId?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @ValidateIf((obj) => obj.categoryId !== null)
  @IsUUID('4', {
    message: 'CategoryId should be valid UUID v4',
  })
  categoryId?: string | null;

  @ApiPropertyOptional({
    description: 'Article tags list ',
    example: ['nestjs', 'typescript', 'backend'],
    type: String,
    isArray: true,
  })
  @IsOptional()
  @IsArray({ message: 'Tags should be an array' })
  @IsString({
    each: true,
    message: 'Each tag in tags should be a string',
  })
  @IsNotEmpty({
    each: true,
    message: 'Each tag in tags should not be empty',
  })
  tags?: string[];
}
