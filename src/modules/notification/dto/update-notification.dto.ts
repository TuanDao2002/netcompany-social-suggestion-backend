import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { IsNotBlank } from '../../../common/validator';

export class UpdateNotificationDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank()
  notificationId: string;

  @IsBoolean()
  isSeen: boolean;
}
