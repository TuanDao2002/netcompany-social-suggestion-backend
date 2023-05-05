import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationCategory } from '../../../common/location-category.enum';
import { WeekDay } from '../../../common/weekday.enum';
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

export class AveragePrice {
  @IsNumber()
  @Min(0)
  value: number;

  @IsEnum(Currency)
  currency: Currency;
}

export class Period {
  @IsEnum(WeekDay)
  @Min(WeekDay.MONDAY)
  @Max(WeekDay.SUNDAY)
  day: WeekDay;

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

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsEnum(LocationCategory)
  locationCategory: LocationCategory;

  @IsObject()
  @ValidateNested()
  @Type(() => AveragePrice)
  averagePrice: AveragePrice;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(0)
  @ArrayMaxSize(Object.keys(WeekDay).length)
  @Type(() => Period)
  periods: [Period];
}
