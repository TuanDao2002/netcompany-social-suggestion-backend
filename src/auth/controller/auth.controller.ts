import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AzureADGuard, AzureADStrategy } from "../strategy/jwt.strategy";

@Controller('auth')
export class AuthController {
  @Get()
  @UseGuards(AzureADGuard)
  async login(@Req() req: Request) {
    return req.user;
  }
}
