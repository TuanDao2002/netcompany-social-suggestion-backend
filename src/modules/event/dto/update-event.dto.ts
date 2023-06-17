import { IsNotEmpty, IsString } from 'class-validator';
import { CreateEventDto } from './create-event.dto';
import { IsNotBlank } from '../../../common/validator';

export class UpdateEventDto extends CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'eventId must not contain only whitespaces' })
  eventId: string;
}
