import { Exclude, Expose } from 'class-transformer';

import { UserRole } from 'src/domain/entities/user.interface';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  login: string;

  @Expose()
  role: (typeof UserRole)[keyof typeof UserRole];

  @Expose()
  createdAt: number;

  @Expose()
  updatedAt: number;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
