import { IsIn, IsOptional } from 'class-validator';

import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Order } from 'src/common/entities/sort.interface';

export const UserFields = ['id', 'login', 'role', 'createdAt', 'updatedAt'];

export class FindUserQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(UserFields)
  sortBy?: (typeof UserFields)[number];

  @IsOptional()
  @IsIn(Order)
  order?: (typeof Order)[number] = Order[0];
}
