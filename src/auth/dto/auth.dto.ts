import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
  } from 'class-validator';
  
  export class AuthDto {
    @IsString()
    @IsOptional()
    microsoftIdToken: string;

    @IsEmail()
    @IsOptional()
    @IsNotEmpty()
    email: string;
  
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    password: string;
  }
  