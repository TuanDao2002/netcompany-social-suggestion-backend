import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { IsNotBlank } from '../../../common/validator';
import { CommonConstant } from '../../../common/constant';

export class UpdateItineraryLocationOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'itinerary id should not be blank' })
  itineraryId: string;

  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(CommonConstant.ITINERARY_LOCATIONS_SIZE_LIMIT)
  @IsString({ each: true })
  savedLocations: [string];
}
