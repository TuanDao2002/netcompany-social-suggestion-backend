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
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsNotBlank } from '../../../common/validator';
import { Type } from 'class-transformer';

export class StartTime {
  @IsNumber()
  @Min(0)
  @Max(24)
  hours: number;

  @IsNumber()
  @Min(0)
  @Max(59)
  minutes: number;
}

export class Duration {
  @IsNumber()
  @Min(0)
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

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'locationId must not contain only whitespaces' })
  locationId: string = null;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StartTime)
  startTime: StartTime = null;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Duration)
  duration: Duration = null;

  @IsArray()
  @ArrayMinSize(0)
  @IsString({ each: true })
  imageUrls: [string];

  @IsOptional()
  @IsString()
  description: string = null;

  @IsBoolean()
  allDay: boolean = false;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  guests: [string];
}
