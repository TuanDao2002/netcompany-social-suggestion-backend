import { EventService } from './service/event.service';
import { EventController } from './controller/event.controller';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from '../location/schema/locations.schema';
import { EventRepository } from "./repository/event.repository";
import { Event, EventSchema } from "./schema/event.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: Event.name, schema: EventSchema },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository],
})
export class EventModule {}
