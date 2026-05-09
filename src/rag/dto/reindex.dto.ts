import {
  IsOptional,
  IsBoolean,
  IsArray,
  IsString,
  IsIn,
} from 'class-validator';
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

  @ApiPropertyOptional({ enum: ['full', 'incremental'], default: 'full' })
  @IsOptional()
  @IsIn(['full', 'incremental'])
  mode?: 'full' | 'incremental' = 'full';
}

export class ReindexResponseDto {
  indexedArticles: number;

  indexedChunks: number;

  vectorCollection: string;

  mode: 'full' | 'incremental';
}
