import { Module } from '@nestjs/common';
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
import { LikeLocationService } from "./service/like-location.service";
import { LikeLocationRepository } from "./repository/like-location.repository";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: LikeLocation.name, schema: LikeLocationSchema },
    ]),
  ],
  controllers: [LocationController],
  providers: [LocationService, LocationRepository, LikeLocationService, LikeLocationRepository],
  exports: [LocationService],
})
export class LocationModule {}
