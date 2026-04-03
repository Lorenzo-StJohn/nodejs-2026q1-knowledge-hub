import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Name should be a string' })
  @IsNotEmpty({ message: 'Name should not be empty' })
  name: string;

  @IsString({ message: 'Description should be a string' })
  @IsNotEmpty({ message: 'Description should not be empty' })
  description: string;
}
