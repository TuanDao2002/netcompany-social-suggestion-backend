import { EventService } from './service/event.service';
import { EventController } from './controller/event.controller';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from '../location/schema/locations.schema';
import { EventRepository } from './repository/event.repository';
import { Event, EventSchema } from './schema/event.schema';
import { NotificationService } from '../notification/service/notification.service';
import {
  Notification,
  NotificationSchema,
} from '../notification/schema/notification.schema';

import { NotificationRepository } from '../notification/repository/notification.repository';
import { PusherService } from '../notification/service/pusher.service';
import {
  ItineraryLocation,
  ItineraryLocationSchema,
} from '../itinerary/schema/itinerary-location.schema';
import {
  NotificationSeen,
  NotificationSeenSchema,
} from '../notification/schema/notification-seen.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: Event.name, schema: EventSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationSeen.name, schema: NotificationSeenSchema },
      { name: ItineraryLocation.name, schema: ItineraryLocationSchema },
    ]),
  ],
  controllers: [EventController],
  providers: [
    EventService,
    EventRepository,
    NotificationService,
    NotificationRepository,
    PusherService,
  ],
})
export class EventModule {}
