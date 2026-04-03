import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { ArticleStatus } from './create-article.dto';

export class FindArticlesQueryDto {
  @IsOptional()
  @IsEnum(ArticleStatus, {
    message:
      'Status should be one of the following: draft, published, or archived',
  })
  status?: ArticleStatus;

  @IsOptional()
  @IsUUID('4', {
    message: 'CategoryId should be valid UUID v4',
  })
  categoryId?: string;

  @IsOptional()
  @IsString({
    message: 'Each tag in tags should be a string',
  })
  @IsNotEmpty({
    message: 'Each tag in tags should not be empty',
  })
  tag?: string;
}
