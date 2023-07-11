import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PusherService } from '../service/pusher.service';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';
import { ChannelAuthResponse } from 'pusher';

@Controller('pusher')
export class PusherController {
  constructor(private readonly pusherService: PusherService) {}

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('auth')
  auth(
    @Body() body: any,
    @CurrentUser() user: UserDocument,
  ): ChannelAuthResponse {
    const socketId = body.socket_id;
    const channelName = body.channel_name;
    if (channelName !== `private-${String(user._id)}`) {
      throw new UnauthorizedException();
    }
    const userInfo = {
      user_id: String(user._id),
      user_info: {
        _id: String(user._id),
        name: user.username,
        email: user.email,
      },
      watchlist: [],
    };
    return this.pusherService.pusher.authorizeChannel(
      socketId,
      channelName,
      userInfo,
    );
  }

  // @Post('noti')
  // test() {
  //   this.pusherService.sendNotification(['123'], {
  //     message: 'this is test',
  //   });
  // }
}
