import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'string' })
  @IsString({ message: 'Content should be a string' })
  @IsNotEmpty({ message: 'Content should not be empty' })
  content: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID('4', {
    message: 'ArticleId should be valid UUID v4',
  })
  articleId: string;

  @ApiProperty({ example: 'b1b73593-2445-421a-af42-359114d6c536' })
  @IsOptional()
  @ValidateIf((obj) => obj.authorId !== null)
  @IsUUID('4', {
    message: 'AuthorId should be valid UUID v4',
  })
  authorId?: string | null;
}
