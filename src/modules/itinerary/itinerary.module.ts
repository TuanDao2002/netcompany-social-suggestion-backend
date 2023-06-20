import { ItineraryService } from './service/itinerary.service';
import { ItineraryController } from './controller/itinerary.controller';
import { Module } from '@nestjs/common';
import { ItineraryRepository } from './repository/itinerary.repository';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Itinerary, ItinerarySchema } from './schema/itinerary.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Itinerary.name, schema: ItinerarySchema },
    ]),
  ],
  controllers: [ItineraryController],
  providers: [ItineraryService, ItineraryRepository],
})
export class ItineraryModule {}
