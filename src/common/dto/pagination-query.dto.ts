import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

const DEFAULT_LIMIT = 10;

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page should be a number' })
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (starting from 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit should be a number' })
  @Min(1)
  limit: number = DEFAULT_LIMIT;
}
