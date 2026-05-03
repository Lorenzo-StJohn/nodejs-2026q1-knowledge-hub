import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeArticleResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  articleId: string;

  @ApiProperty({ example: 'The code has some issues with error handling.' })
  analysis: string;

  @ApiProperty({ example: ['Add try-catch block', 'Validate input'] })
  suggestions: string[];

  @ApiProperty({ enum: ['info', 'warning', 'error'], example: 'warning' })
  severity: 'info' | 'warning' | 'error';
}
