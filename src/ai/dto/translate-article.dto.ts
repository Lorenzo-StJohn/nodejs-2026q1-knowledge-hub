import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class TranslateArticleRequestDto {
  @ApiProperty({
    description: 'Target language for translation (e.g., "French", "es", "de")',
    example: 'French',
  })
  @IsString()
  targetLanguage: string;

  @ApiPropertyOptional({
    description: 'Source language (if not provided, auto-detect)',
    example: 'English',
  })
  @IsOptional()
  @IsString()
  sourceLanguage?: string;
}
