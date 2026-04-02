import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @IsString({ message: 'Old password should be a string' })
  @IsNotEmpty({ message: 'Old password should not be empty' })
  oldPassword: string;

  @IsString({ message: 'New password should be a string' })
  @IsNotEmpty({ message: 'New password should not be empty' })
  newPassword: string;
}
