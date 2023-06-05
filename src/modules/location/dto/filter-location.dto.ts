import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
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
  @IsOptional()
  @IsString()
  searchInput: string;

  @IsOptional()
  @IsEnum(LocationCategory)
  locationCategory: LocationCategory;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Period)
  @IsValidPeriod({
    message: 'The opening time must be before the closing time on weekday',
  })
  weekday: Period;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Period)
  @IsValidPeriod({
    message: 'The opening time must be before the closing time on weekend',
  })
  weekend: Period;

  @IsOptional()
  @IsNumber()
  @Min(SearchDistance.MIN_DISTANCE)
  @Max(SearchDistance.MAX_DISTANCE)
  searchDistance: number;
}
