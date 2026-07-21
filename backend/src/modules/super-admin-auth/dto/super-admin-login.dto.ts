import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuperAdminLoginDto {
  @ApiProperty({ example: 'admin@webzio.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '••••••••' })
  @IsString()
  @MinLength(6)
  password: string;
}
