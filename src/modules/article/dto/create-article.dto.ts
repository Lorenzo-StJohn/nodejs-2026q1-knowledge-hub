import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class CreateArticleDto {
  @IsString({ message: 'Title should be a string' })
  @IsNotEmpty({ message: 'Title should not be empty' })
  title: string;

  @IsString({ message: 'Content should be a string' })
  @IsNotEmpty({ message: 'Content should not be empty' })
  content: string;

  @IsOptional()
  @IsEnum(ArticleStatus, {
    message:
      'Status should be one of the following: draft, published, or archived',
  })
  status?: ArticleStatus;

  @IsOptional()
  @ValidateIf((obj) => obj.authorId !== null)
  @IsUUID('4', {
    message: 'AuthorId should be valid UUID v4',
  })
  authorId?: string | null;

  @IsOptional()
  @ValidateIf((obj) => obj.categoryId !== null)
  @IsUUID('4', {
    message: 'CategoryId should be valid UUID v4',
  })
  categoryId?: string | null;

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
