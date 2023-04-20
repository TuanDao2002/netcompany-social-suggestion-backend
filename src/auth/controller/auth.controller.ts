import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { Strategy } from 'passport-azure-ad';
import { SigninDto } from '../dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(AuthGuard(Strategy))
  signin(@Req() request) {
    const token = this.jwtService.sign({ sub: request.user.oid });
    console.log("🚀 ~ file: auth.controller.ts:20 ~ AuthController ~ signin ~ token:", token)

    return {
      username: request.user.displayName,
      email: request.user.mail,
      accessToken: token,
    };
  }

  @Delete()
  signout() {
    return this.authService.signout();
  }
}
function AuthGuard(Strategy: any): any {
  throw new Error('Function not implemented.');
}
