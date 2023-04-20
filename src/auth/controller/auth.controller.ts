import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async login(@Req() req: Request) {
    return req.user;
  }
}
