import { Role } from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  login: string;

  @Expose()
  role: Role;

  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.getTime() : value))
  createdAt: number;

  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.getTime() : value))
  updatedAt: number;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
