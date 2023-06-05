import {
  IsEnum,
  IsNumber,
  IsObject,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { LocationCategory } from '../../../common/location-category.enum';
import { Type } from 'class-transformer';
import { Period } from './create-location.dto';
import { IsValidPeriod } from '../../../common/validator';
import { SearchDistance } from '../../../common/search-distance.enum';

export class FilterLocationDto {
  @IsString()
  searchInput: string;

  @IsEnum(LocationCategory)
  locationCategory: LocationCategory;

  @IsObject()
  @ValidateNested()
  @Type(() => Period)
  @IsValidPeriod({
    message: 'The opening time must be before the closing time on weekday',
  })
  weekday: Period;

  @IsObject()
  @ValidateNested()
  @Type(() => Period)
  @IsValidPeriod({
    message: 'The opening time must be before the closing time on weekend',
  })
  weekend: Period;

  @IsNumber()
  @Min(SearchDistance.MIN_DISTANCE)
  @Max(SearchDistance.MAX_DISTANCE)
  searchDistance: number;
}
