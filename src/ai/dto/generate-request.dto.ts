import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class GenerateRequestDto {
  @ApiProperty({
    description: 'The prompt or question for the AI',
    example: 'What is the capital of France?',
  })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({
    description: 'Maximum tokens in the generated response',
    minimum: 1,
    maximum: 8192,
    default: 512,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8192)
  maxOutputTokens?: number;

  @ApiPropertyOptional({
    description: 'Sampling temperature (0 = deterministic, 2 = most random)',
    minimum: 0,
    maximum: 2,
    default: 0.7,
    example: 0.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiPropertyOptional({
    description:
      'Session ID for multi-turn conversation (leave empty for single prompt)',
    example: 'user_abc123',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    description:
      'Set to true to clear the conversation history for this session',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  clearSession?: boolean;
}
