import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { CommonConstant } from '../../../common/constant';
import { AuthDto } from '../dto/auth.dto';
import { JwtGuard } from '../guard/jwt.guard';
import { CurrentUser } from '../guard/user.decorator';
import { AuthService } from '../service/auth.service';
import { AccountStatus } from '../../../common/account-status.enum';

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
    const { accountStatus, accessToken } =
      await this.authService.signInWithMicrosoft(microsoftIdToken);

    if (accountStatus === AccountStatus.UNVERIFIED) {
      res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ msg: 'The account is not verified yet' });
    } else {
      res.cookie('access_token', accessToken, {
        maxAge: CommonConstant.MAX_AGE,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });

      res.json({ accessToken });
    }
  }

  @UseGuards(JwtGuard)
  @Delete('logout')
  async logOut(@Res() res: Response, @CurrentUser() user: any) {
    console.log(
      '🚀 ~ file: auth.controller.ts:45 ~ AuthController ~ logOut ~ user:',
      user,
    );
    res.cookie('access_token', '', {
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    res.json({ msg: 'Logout' });
  }
}
