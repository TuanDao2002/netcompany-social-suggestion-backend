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
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { VerifyUserDto } from '../../user/dto/verify-user.dto';
import { UserDocument } from '../../user/schema/users.schema';

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
    const { accountStatus, accessToken, idToken } =
      await this.authService.signInWithMicrosoft(microsoftIdToken);

    if (accountStatus === AccountStatus.UNVERIFIED) {
      res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ msg: 'The account is not verified yet', idToken });
    } else {
      res.cookie('access_token', accessToken, {
        maxAge: CommonConstant.MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'dev' ? false : true,
        sameSite: 'none',
        path: '/',
      });

      res.json({ accessToken });
    }
  }

  @Post('verify')
  async verify(@Body() body: VerifyUserDto, @Res() res: Response) {
    const { accountStatus, accessToken, verifiedUser } =
      await this.authService.verify(body);

    res.cookie('access_token', accessToken, {
      maxAge: CommonConstant.MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'dev' ? false : true,
      sameSite: 'none',
      path: '/',
    });

    res.json({ accountStatus, accessToken, verifiedUser });
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
      secure: process.env.NODE_ENV === 'dev' ? false : true,
      sameSite: 'none',
      path: '/',
    });
    res.json({ msg: 'Logout' });
  }
}
