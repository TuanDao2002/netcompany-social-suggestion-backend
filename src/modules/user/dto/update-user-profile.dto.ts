import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  NotEquals,
  ValidateIf,
} from 'class-validator';
import { LocationCategory } from '../../../common/location-category.enum';

export class UpdateUserProfileDto {
  @IsString()
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  username: string;

  @IsString()
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  imageUrl: string;

  @IsArray()
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsEnum(LocationCategory, { each: true })
  @ArrayMinSize(0)
  @ArrayMaxSize(Object.keys(LocationCategory).length)
  locationCategories: [LocationCategory];

  @IsNumber()
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsPositive()
  searchDistance: number;
}
