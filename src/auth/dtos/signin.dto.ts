import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SigninDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
