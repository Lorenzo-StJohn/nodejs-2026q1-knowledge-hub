import { IsUUID } from 'class-validator';

export class FindUserParamDto {
  @IsUUID('4', { message: 'ID should be valid UUID v4' })
  id: string;
}
