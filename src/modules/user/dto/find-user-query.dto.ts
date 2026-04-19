import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Order } from 'src/common/entities/sort.interface';

export const UserFields = ['id', 'login', 'role', 'createdAt', 'updatedAt'];

export class FindUserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'The field to sort by',
    enum: UserFields,
    example: 'login',
  })
  @IsOptional()
  @IsIn(UserFields)
  sortBy?: (typeof UserFields)[number] = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sorting direction',
    enum: Order,
    example: 'DESC',
  })
  @IsOptional()
  @IsIn(Order)
  order?: (typeof Order)[number] = Order[0];
}
