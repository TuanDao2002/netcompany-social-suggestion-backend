import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from "../service/auth.service";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('')
  async index(@Headers('authorization') authorization: string): Promise<string> {
    const accessToken = authorization?.replace('Bearer ', '');
    if (!accessToken) {
      throw new UnauthorizedException('Access token missing');
    }

    const isValid = await this.authService.validateAccessToken(accessToken);
    if (!isValid) {
      throw new UnauthorizedException('Access token invalid');
    }

    return 'Access token is valid';
  }
}
