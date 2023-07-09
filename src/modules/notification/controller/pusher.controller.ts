import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PusherService } from '../service/pusher.service';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';
import { UserAuthResponse } from 'pusher';

@Controller('pusher')
export class PusherController {
  constructor(private readonly pusherService: PusherService) {}

  @UseGuards(JwtGuard)
  @Post('user-auth')
  auth(@Body() body: any, @CurrentUser() user: UserDocument): UserAuthResponse {
    const socketId = body.socket_id;
    const userInfo = {
      id: String(user._id),
      user_info: {
        _id: String(user._id),
        name: user.username,
        email: user.email,
      },
      watchlist: [],
    };
    return this.pusherService.pusher.authenticateUser(socketId, userInfo);
  }
}
