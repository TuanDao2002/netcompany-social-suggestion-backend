import { IsBoolean, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsBoolean()
  isVerified: boolean;

  @IsEmail()
  email: string;
}
