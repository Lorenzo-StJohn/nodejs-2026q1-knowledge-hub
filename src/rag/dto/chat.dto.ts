import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RagChatRequestDto {
  @ApiProperty({ example: 'string' })
  @IsString()
  question: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  conversationId?: string;
}

export class RagChatResponseDto {
  answer: string;

  sources: { articleId: string; articleTitle: string; relevantChunk: string }[];

  conversationId: string;
}
