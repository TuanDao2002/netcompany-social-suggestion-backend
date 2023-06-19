import { ItineraryService } from './service/itinerary.service';
import { ItineraryController } from './controller/itinerary.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [ItineraryController],
  providers: [ItineraryService],
})
export class ItineraryModule {}
