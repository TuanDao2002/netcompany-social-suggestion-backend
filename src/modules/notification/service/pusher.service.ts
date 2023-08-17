import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UserDocument } from '../../user/schema/users.schema';

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

  public sendNotifications(
    notifications: CreateNotificationDto[],
    modifier: UserDocument,
  ) {
    for (let notification of notifications) {
      this.pusher.trigger(
        `private-${notification.targetUserId}`,
        'notification',
        { ...notification, modifierImageUrl: modifier.imageUrl },
      );
    }
  }
}
