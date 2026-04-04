import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'string' })
  @IsString({ message: 'Old password should be a string' })
  @IsNotEmpty({ message: 'Old password should not be empty' })
  oldPassword: string;

  @ApiProperty({ example: 'string' })
  @IsString({ message: 'New password should be a string' })
  @IsNotEmpty({ message: 'New password should not be empty' })
  newPassword: string;
}
