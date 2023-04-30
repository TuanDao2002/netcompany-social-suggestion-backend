import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString
} from 'class-validator';
import { LocationCategory } from '../../../common/location-category.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username: string;

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
  @IsPositive()
  searchDistance: number;
}
