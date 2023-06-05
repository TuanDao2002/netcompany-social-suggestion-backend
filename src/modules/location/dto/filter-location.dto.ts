import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
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
  @MaxLength(100, {
    message: 'Search input should be less than 100 characters',
  })
  searchInput: string;

  @IsOptional()
  @IsEnum(LocationCategory)
  locationCategory: LocationCategory;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Period)
  @IsValidPeriod({
    message: 'The opening time and closing time on weekday must be valid',
  })
  weekday: Period;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Period)
  @IsValidPeriod({
    message: 'The opening time and closing time on weekend must be valid',
  })
  weekend: Period;

  @IsOptional()
  @IsNumber()
  @Min(SearchDistance.MIN_DISTANCE)
  @Max(SearchDistance.MAX_DISTANCE)
  searchDistance: number;
}
