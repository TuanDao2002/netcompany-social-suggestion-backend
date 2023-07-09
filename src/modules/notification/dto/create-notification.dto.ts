import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsNotBlank } from '../../../common/validator';
import { ModelType } from '../../../common/model-type.enum';
import { Type } from 'class-transformer';

export class RedirectToDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank()
  targetId: string;

  @IsEnum(ModelType)
  modelType: ModelType;
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank()
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank()
  targetUserId: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank()
  modifierId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => RedirectToDto)
  redirectTo: RedirectToDto;
}
