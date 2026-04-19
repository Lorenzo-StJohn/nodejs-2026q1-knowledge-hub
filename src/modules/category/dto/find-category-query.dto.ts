import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Order } from 'src/common/entities/sort.interface';

export const CategoryFields = ['id', 'name', 'description'];

export class FindCategoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'The field to sort by',
    enum: CategoryFields,
    example: 'name',
  })
  @IsOptional()
  @IsIn(CategoryFields)
  sortBy?: (typeof CategoryFields)[number];

  @ApiPropertyOptional({
    description: 'Sorting direction',
    enum: Order,
    example: 'DESC',
  })
  @IsOptional()
  @IsIn(Order)
  order?: (typeof Order)[number] = Order[0];
}
