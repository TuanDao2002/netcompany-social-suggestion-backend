import { IsNotEmpty, IsString } from 'class-validator';
import { IsNotBlank } from '../../../common/validator';

export class UpdateReplyDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'replyId must not contain only whitespaces' })
  replyId: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'content must not contain only whitespaces' })
  content: string;
}
