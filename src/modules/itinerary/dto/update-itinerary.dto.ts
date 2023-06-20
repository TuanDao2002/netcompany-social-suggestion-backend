import { IsNotEmpty, IsString } from 'class-validator';
import { CreateItineraryDto } from './create-itinerary.dto';
import { IsNotBlank } from '../../../common/validator';

export class UpdateItineraryDto extends CreateItineraryDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'itinerary id should not be blank' })
  itineraryId: string;
}
