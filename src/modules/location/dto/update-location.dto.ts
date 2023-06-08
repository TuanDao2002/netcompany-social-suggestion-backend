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
  description: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
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
  weekday: Period;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Period)
  weekend: Period;
}
