import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationCategory } from '../../../common/location-category.enum';
import { CommonConstant } from '../../../common/constant';
import { Currency } from '../../../common/currency.enum';
import {
  IsNotBlank,
  IsValidPriceRange,
} from '../../../common/validator';

export class Location {
  @IsEnum(['Point'])
  type: ['Point'];

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  coordinates: [number, number];
}

export class PricePerPerson {
  @IsNumber()
  @Min(0)
  min: number;

  @IsNumber()
  @Min(0)
  max: number;

  @IsEnum(Currency)
  currency: Currency;
}

export class Period {
  @IsString()
  @Matches(CommonConstant.TimeRegex)
  openTime: string;

  @IsString()
  @Matches(CommonConstant.TimeRegex)
  closeTime: string;
}

export class CreateLocationDto {
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

  @IsArray()
  @ArrayMinSize(0)
  @IsString({ each: true })
  imageUrls: [string];

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

  @IsObject()
  @ValidateNested()
  @Type(() => Period)
  weekday: Period;

  @IsObject()
  @ValidateNested()
  @Type(() => Period)
  weekend: Period;
}
