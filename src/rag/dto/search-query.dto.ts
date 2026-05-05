import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';

export class RagSearchRequestDto {
  @ApiProperty({ example: 'string' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number;

  @ApiPropertyOptional({
    enum: ArticleStatus,
    example: 'draft',
  })
  @IsOptional()
  @IsString()
  articleStatus?: string;

  @ApiPropertyOptional({ example: '0e2f864e-8611-4e41-9d49-1c94b1df5c95' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({ example: ['string'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
