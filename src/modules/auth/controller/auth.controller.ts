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
    const { accountStatus, accessToken, idToken, user } =
      await this.authService.signInWithMicrosoft(microsoftIdToken);

    if (accountStatus === AccountStatus.UNVERIFIED) {
      res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ msg: 'The account is not verified yet', idToken, username: user.username });
    } else {
      res.cookie('access_token', accessToken, {
        maxAge: CommonConstant.MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'dev' ? false : true,
        sameSite: 'none',
        path: '/',
      });

      res.json({ accessToken, user });
    }
  }

  @Post('verify')
  async verify(@Body() body: VerifyUserDto, @Res() res: Response): Promise<void> {
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

  @Delete('logout')
  async logOut(@Res() res: Response) {
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
