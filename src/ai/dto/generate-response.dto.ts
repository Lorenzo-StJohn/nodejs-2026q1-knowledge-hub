import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateResponseDto {
  @ApiProperty({ example: 'The capital of France is Paris.' })
  generatedText: string;

  @ApiPropertyOptional({ example: 'session_abc123' })
  sessionId?: string;

  @ApiPropertyOptional({
    example: { promptTokens: 10, completionTokens: 15, totalTokens: 25 },
  })
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
