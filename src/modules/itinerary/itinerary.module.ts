import { ItineraryService } from './service/itinerary.service';
import { ItineraryController } from './controller/itinerary.controller';
import { Module } from '@nestjs/common';
import { ItineraryRepository } from './repository/itinerary.repository';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Itinerary, ItinerarySchema } from './schema/itinerary.schema';
import {
  ItineraryLocation,
  ItineraryLocationSchema,
} from './schema/itinerary-location.schema';
import { ItineraryLocationRepository } from './repository/itinerary-location.repository';
import { ItineraryLocationService } from './service/itinerary-location.service';
import { LocationRepository } from '../location/repository/location.repository';
import { Location, LocationSchema } from '../location/schema/locations.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Itinerary.name, schema: ItinerarySchema },
      { name: ItineraryLocation.name, schema: ItineraryLocationSchema },
      { name: Location.name, schema: LocationSchema },
    ]),
  ],
  controllers: [ItineraryController],
  providers: [
    ItineraryService,
    ItineraryRepository,
    ItineraryLocationService,
    ItineraryLocationRepository,
    LocationRepository,
  ],
})
export class ItineraryModule {}
