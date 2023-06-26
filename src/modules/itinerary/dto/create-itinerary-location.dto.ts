import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsNotBlank } from '../../../common/validator';
import { CommonConstant } from '../../../common/constant';

export class CreateItineraryLocationDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'itineraryId should not be blank' })
  itineraryId: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'locationId should not be blank' })
  locationId: string;

  @IsOptional()
  @IsString()
  @MaxLength(CommonConstant.ITINERARY_LOCATIONS_NOTE_LIMIT)
  note: string;
}
