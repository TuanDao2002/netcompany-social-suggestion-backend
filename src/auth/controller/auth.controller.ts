import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @Get()
  @UseGuards(AuthGuard('azure-ad'))
  async login(@Req() req) {
    return req.user;
  }
}
