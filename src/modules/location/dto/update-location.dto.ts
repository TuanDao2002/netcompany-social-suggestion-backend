import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LocationCategory } from '../../../common/location-category.enum';
import {
  IsNotBlank,
  IsValidPeriod,
  IsValidPriceRange,
} from '../../../common/validator';
import { Location, Period, PricePerPerson } from './create-location.dto';

export class UpdateLocationDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'locationId must not contain only whitespaces' })
  locationId: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'placeId must not contain only whitespaces' })
  placeId: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'name must not contain only whitespaces' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'address must not contain only whitespaces' })
  address: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Location)
  location: Location;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'description must not contain only whitespaces' })
  description: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  imageUrls: [string];

  @IsOptional()
  @IsEnum(LocationCategory)
  locationCategory: LocationCategory;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PricePerPerson)
  @IsValidPriceRange({
    message: 'The min price must be smaller than max price',
  })
  pricePerPerson: PricePerPerson;

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
}
