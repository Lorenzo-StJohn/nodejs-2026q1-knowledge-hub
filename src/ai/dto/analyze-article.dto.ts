import { IsOptional, IsIn } from 'class-validator';

export class AnalyzeArticleRequestDto {
  @IsOptional()
  @IsIn(['review', 'bugs', 'optimize', 'explain'])
  task?: 'review' | 'bugs' | 'optimize' | 'explain' = 'review';
}
