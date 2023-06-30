import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsNotBlank } from '../../../common/validator';

export class CreateItineraryDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'name must not contain only whitespaces' })
  @MaxLength(50)
  name: string;
}
