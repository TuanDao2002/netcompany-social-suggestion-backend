import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Coordinates } from '../../user/dto/verify-user.dto';
import { Type } from 'class-transformer';
import { LocationCategory } from '../../../common/location-category.enum';
import { WeekDay } from '../../../common/weekday.enum';
import { CommonConstant } from '../../../common/constant';

export class AveragePrice {
  @IsNumber()
  value: number;

  @IsString()
  currency: string;
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
  name: string;

  @IsString()
  address: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Coordinates)
  coordinates: Coordinates;

  @IsArray()
  @IsEnum(LocationCategory, { each: true })
  @ArrayMinSize(0)
  @ArrayMaxSize(Object.keys(LocationCategory).length)
  locationCategories: [LocationCategory];

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
