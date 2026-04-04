import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @ApiProperty({ example: 'string' })
  @IsString({ message: 'Login should be a string' })
  @IsNotEmpty({ message: 'Login should not be empty' })
  login: string;

  @ApiProperty({ example: 'string' })
  @IsString({ message: 'Password should be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;

  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  @IsEnum(UserRole, {
    message:
      'Role should be one of the following: administrator, editor, or viewer',
  })
  role?: UserRole;
}
