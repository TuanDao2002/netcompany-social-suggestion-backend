import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './controller/notification.controller';
import { PusherController } from './controller/pusher.controller';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationService } from './service/notification.service';
import { Module } from '@nestjs/common';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { PusherService } from './service/pusher.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationController, PusherController],
  providers: [NotificationService, NotificationRepository, PusherService],
})
export class NotificationModule {}
