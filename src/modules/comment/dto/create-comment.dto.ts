import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'Content should be a string' })
  @IsNotEmpty({ message: 'Content should not be empty' })
  content: string;

  @IsUUID('4', {
    message: 'ArticleId should be valid UUID v4',
  })
  articleId: string;

  @IsOptional()
  @ValidateIf((obj) => obj.authorId !== null)
  @IsUUID('4', {
    message: 'AuthorId should be valid UUID v4',
  })
  authorId?: string | null;
}
