import { Type } from "class-transformer";
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
  ValidateNested
} from 'class-validator';
import { LocationCategory } from '../../../common/location-category.enum';

class Coordinates {
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
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsArray()
  @IsEnum(LocationCategory, { each: true })
  @ArrayMinSize(0)
  @ArrayMaxSize(Object.keys(LocationCategory).length)
  locationCategories: [LocationCategory];

  @IsNumber()
  @IsOptional()
  searchDistance: number;

  @IsObject()
  @ValidateNested()
  @Type(() => Coordinates)
  coordinates: Coordinates;
}
