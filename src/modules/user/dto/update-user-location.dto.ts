import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { Coordinates } from './verify-user.dto';

export class UpdateUserLocationDto {
  @IsObject()
  @ValidateNested()
  @Type(() => Coordinates)
  coordinates: Coordinates;
}
