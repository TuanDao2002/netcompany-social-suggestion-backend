import { EventService } from './service/event.service';
import { EventController } from './controller/event.controller';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from '../location/schema/locations.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
