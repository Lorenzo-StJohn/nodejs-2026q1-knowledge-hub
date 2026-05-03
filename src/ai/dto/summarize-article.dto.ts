import { IsOptional, IsIn } from 'class-validator';

export class SummarizeArticleRequestDto {
  @IsOptional()
  @IsIn(['short', 'medium', 'detailed'])
  maxLength?: 'short' | 'medium' | 'detailed' = 'medium';
}
