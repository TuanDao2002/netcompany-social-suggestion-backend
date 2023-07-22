import { Module, forwardRef } from '@nestjs/common';
import { LocationController } from './controller/location.controller';
import { LocationService } from './service/location.service';
import { LocationRepository } from './repository/location.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from './schema/locations.schema';
import { AuthModule } from '../auth/auth.module';
import {
  LikeLocation,
  LikeLocationSchema,
} from './schema/like-location.schema';
import { LikeLocationService } from './service/like-location.service';
import { LikeLocationRepository } from './repository/like-location.repository';
import { Event, EventSchema } from '../event/schema/event.schema';
import { EventRepository } from '../event/repository/event.repository';
import { NotificationService } from "../notification/service/notification.service";
import { NotificationRepository } from "../notification/repository/notification.repository";
import { PusherService } from "../notification/service/pusher.service";
import { Notification, NotificationSchema } from "../notification/schema/notification.schema";
import { NotificationModule } from "../notification/notification.module";
import { EventModule } from "../event/event.module";
import { ItineraryLocation, ItineraryLocationSchema } from "../itinerary/schema/itinerary-location.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: LikeLocation.name, schema: LikeLocationSchema },
      { name: Event.name, schema: EventSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: ItineraryLocation.name, schema: ItineraryLocationSchema },
    ]),
    forwardRef(() => NotificationModule),
    forwardRef(() => EventModule),
  ],
  controllers: [LocationController],
  providers: [
    LocationService,
    LocationRepository,
    LikeLocationService,
    LikeLocationRepository,
    NotificationService,
    NotificationRepository,
    EventRepository,
    PusherService
  ],
  exports: [LocationService],
})
export class LocationModule {}
