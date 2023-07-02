import { IsNotEmpty, IsString } from 'class-validator';
import { IsNotBlank } from '../../../common/validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'locationId must not contain only whitespaces' })
  locationId: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'content must not contain only whitespaces' })
  content: string;
}
