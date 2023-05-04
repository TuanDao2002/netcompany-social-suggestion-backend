import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Max,
  Min,
  NotEquals,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import { LocationCategory } from '../../../common/location-category.enum';
import { SearchDistance } from "../../../common/search-distance.enum";

export class Coordinates {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class VerifyUserDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @IsString()
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  username: string;

  @IsString()
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  imageUrl: string;

  @IsArray()
  @IsEnum(LocationCategory, { each: true })
  @ArrayMinSize(0)
  @ArrayMaxSize(Object.keys(LocationCategory).length)
  locationCategories: [LocationCategory];

  @IsNumber()
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)  
  @Min(SearchDistance.MIN_DISTANCE)
  @Max(SearchDistance.MAX_DISTANCE)
  searchDistance: number;

  @IsObject()
  @ValidateNested()
  @Type(() => Coordinates)
  coordinates: Coordinates;
}
