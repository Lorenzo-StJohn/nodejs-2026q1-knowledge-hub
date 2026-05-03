import { ApiProperty } from '@nestjs/swagger';

export class SummarizeArticleResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  articleId: string;

  @ApiProperty({ example: 'This is a summary of the article.' })
  summary: string;

  @ApiProperty({ example: 2500 })
  originalLength: number;

  @ApiProperty({ example: 150 })
  summaryLength: number;
}
