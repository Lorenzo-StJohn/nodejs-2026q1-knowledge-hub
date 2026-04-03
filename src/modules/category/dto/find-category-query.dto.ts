import { IsIn, IsOptional } from 'class-validator';

import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Order } from 'src/common/entities/sort.interface';

export const CategoryFields = ['id', 'name', 'description'];

export class FindCategoryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(CategoryFields)
  sortBy?: (typeof CategoryFields)[number];

  @IsOptional()
  @IsIn(Order)
  order?: (typeof Order)[number] = Order[0];
}
