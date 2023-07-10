import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
  pusher: Pusher;
  constructor(private readonly configService: ConfigService) {
    this.pusher = new Pusher({
      appId: this.configService.get('PUSHER_APP_ID'),
      key: this.configService.get('PUSHER_KEY'),
      secret: this.configService.get('PUSHER_SECRET'),
      cluster: this.configService.get('PUSHER_CLUSTER'),
      useTLS: true,
    });
  }

  public sendNotification(targetUserIds: string[], notification: any) {
    for (let targetUserId of targetUserIds) {
      this.pusher.trigger(
        `private-${targetUserId}`,
        'notification',
        notification,
      );
    }
  }
}
