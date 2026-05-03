import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

export class SummarizeArticleRequestDto {
  @ApiPropertyOptional({
    description: 'Maximum length of the summary',
    enum: ['short', 'medium', 'detailed'],
    default: 'medium',
    example: 'short',
  })
  @IsOptional()
  @IsIn(['short', 'medium', 'detailed'])
  maxLength?: 'short' | 'medium' | 'detailed' = 'medium';
}
