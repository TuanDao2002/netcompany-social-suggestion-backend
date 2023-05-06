import { Module } from '@nestjs/common';
import { LocationController } from './controller/location.controller';
import { LocationService } from './service/location.service';
import { LocationRepository } from './repository/location.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from './schema/locations.schema';
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
    ]),
  ],
  controllers: [LocationController],
  providers: [LocationService, LocationRepository],
  exports: [LocationService],
})
export class LocationModule {}
