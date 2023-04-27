import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsBoolean()
  isVerified: boolean;

  @IsString()
  username: string;

  @IsEmail()
  email: string;
}
