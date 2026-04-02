import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @IsString({ message: 'Login should be a string' })
  @IsNotEmpty({ message: 'Login should not be empty' })
  login: string;

  @IsString({ message: 'Password should be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, {
    message:
      'Role should be one of the following: administrator, editor, or viewer',
  })
  role?: UserRole;
}
