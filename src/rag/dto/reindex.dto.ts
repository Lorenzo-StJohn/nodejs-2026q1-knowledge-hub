import { IsOptional, IsBoolean, IsArray, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReindexRequestDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  onlyPublished?: boolean;

  @ApiPropertyOptional({ example: ['string'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  articleIds?: string[];
}

export class ReindexResponseDto {
  indexedArticles: number;

  indexedChunks: number;

  vectorCollection: string;
}
