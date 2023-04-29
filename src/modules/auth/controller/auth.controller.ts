import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Res
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AccountStatus } from '../../../common/account-status.enum';
import { CommonConstant } from '../../../common/constant';
import { VerifyUserDto } from '../../user/dto/verify-user.dto';
import { AuthDto } from '../dto/auth.dto';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('')
  async signIn(@Body() body: AuthDto, @Res() res: Response): Promise<void> {
    const { microsoftIdToken } = body;
    const { accountStatus, accessToken, idToken, user } =
      await this.authService.signInWithMicrosoft(microsoftIdToken);

    if (accountStatus === AccountStatus.UNVERIFIED) {
      res.status(HttpStatus.NOT_ACCEPTABLE).json({
        msg: 'The account is not verified yet',
        idToken,
        username: user.username,
      });
    } else {
      res.cookie('access_token', accessToken, CommonConstant.COOKIE_OPTIONS);
      res.json({ accessToken, user });
    }
  }

  @Post('verify')
  async verify(
    @Body() body: VerifyUserDto,
    @Res() res: Response,
  ): Promise<void> {
    const { accountStatus, accessToken, verifiedUser } =
      await this.authService.verify(body);

    res.cookie('access_token', accessToken, CommonConstant.COOKIE_OPTIONS);
    res.json({ accountStatus, accessToken, verifiedUser });
  }

  @Delete('logout')
  async logOut(@Res() res: Response) {
    res.cookie('access_token', '', {
      ...CommonConstant.COOKIE_OPTIONS,
      maxAge: 0,
    });
    res.json({ msg: 'Logout' });
  }
}
