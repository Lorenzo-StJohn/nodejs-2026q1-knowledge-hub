import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMzRiMWU3Yy1iNTg5LTQ0M2MtYTU1ZS0zYjkxNmUxZGZkM2YiLCJsb2dpbiI6InN0cmluZzIyMiIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE3NzY2MjA2NDMsImV4cCI6MTc3NzIyNTQ0M30.aaRmwcAngHNnG7kn_QHv8Udu_IPWOmKNh-fQyFKno2A',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
