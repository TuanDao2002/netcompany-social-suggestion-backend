import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsBoolean()
  isVerified: boolean;

  @IsEmail()
  email: string;
}
