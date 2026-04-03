import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

const DEFAULT_LIMIT = 10;

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = DEFAULT_LIMIT;
}
