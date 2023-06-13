import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsNotBlank } from '../../../common/validator';
import { CommonConstant } from '../../../common/constant';
import { Type } from 'class-transformer';

export class Duration {
  @IsNumber()
  @Min(0)
  @Max(24)
  hours: number;

  @IsNumber()
  @Min(0)
  @Max(59)
  minutes: number;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'name must not contain only whitespaces' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'locationId must not contain only whitespaces' })
  locationId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  @Matches(CommonConstant.TimeRegex)
  startTime: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Duration)
  duration: Duration;

  @IsArray()
  @ArrayMinSize(0)
  @IsString({ each: true })
  imageUrls: [string];

  @IsOptional()
  @IsString()
  description: string;

  @IsBoolean()
  allDay: boolean = false;

  @IsArray()
  @ArrayMinSize(0)
  @IsString({ each: true })
  guests: [string];
}
