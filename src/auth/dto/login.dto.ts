import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'string' })
  @IsString({ message: 'Login should be a string' })
  @IsNotEmpty({ message: 'Login should not be empty' })
  login: string;

  @ApiProperty({ example: 'string' })
  @IsString({ message: 'Password should be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;
}
