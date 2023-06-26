import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CommonConstant } from '../../../common/constant';
import { IsNotBlank } from '../../../common/validator';

export class UpdateItineraryLocationDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'itineraryLocationId should not be blank' })
  itineraryLocationId: string;

  @IsString()
  @MaxLength(CommonConstant.ITINERARY_LOCATIONS_NOTE_LIMIT)
  note: string;
}
