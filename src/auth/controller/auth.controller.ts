import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { SigninDto } from "../dto/signin.dto";


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Delete()
  signout() {
    return this.authService.signout();
  }
}
