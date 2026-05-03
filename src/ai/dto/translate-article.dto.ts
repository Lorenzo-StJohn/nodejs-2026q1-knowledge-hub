import { IsString, IsOptional } from 'class-validator';

export class TranslateArticleRequestDto {
  @IsString()
  targetLanguage: string;

  @IsOptional()
  @IsString()
  sourceLanguage?: string;
}
