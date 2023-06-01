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
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Location)
  location: Location;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  imageUrls: [string];

  @IsEnum(LocationCategory)
  locationCategory: LocationCategory;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PricePerPerson)
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
