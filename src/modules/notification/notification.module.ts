import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './controller/notification.controller';
import { PusherController } from './controller/pusher.controller';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationService } from './service/notification.service';
import { Module } from '@nestjs/common';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { PusherService } from './service/pusher.service';
import { Event, EventSchema } from '../event/schema/event.schema';
import { EventRepository } from '../event/repository/event.repository';
import { EventService } from '../event/service/event.service';
import {
  ItineraryLocation,
  ItineraryLocationSchema,
} from '../itinerary/schema/itinerary-location.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Event.name, schema: EventSchema },
      { name: ItineraryLocation.name, schema: ItineraryLocationSchema },
    ]),
  ],
  controllers: [NotificationController, PusherController],
  providers: [
    NotificationService,
    NotificationRepository,
    PusherService,
    EventRepository,
  ],
})
export class NotificationModule {}
