import { ApiProperty } from '@nestjs/swagger';

export class TranslateArticleResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  articleId: string;

  @ApiProperty({ example: 'Este es un texto traducido.' })
  translatedText: string;

  @ApiProperty({ example: 'es' })
  detectedLanguage: string;
}
