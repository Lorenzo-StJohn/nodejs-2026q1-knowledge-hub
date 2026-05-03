import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

export class AnalyzeArticleRequestDto {
  @ApiPropertyOptional({
    description: 'Type of analysis task',
    enum: ['review', 'bugs', 'optimize', 'explain'],
    default: 'review',
    example: 'bugs',
  })
  @IsOptional()
  @IsIn(['review', 'bugs', 'optimize', 'explain'])
  task?: 'review' | 'bugs' | 'optimize' | 'explain' = 'review';
}
