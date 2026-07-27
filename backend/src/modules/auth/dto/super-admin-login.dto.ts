import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SuperAdminLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
