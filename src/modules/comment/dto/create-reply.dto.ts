import { IsNotEmpty, IsString } from 'class-validator';
import { IsNotBlank } from '../../../common/validator';

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'targetCommentId must not contain only whitespaces' })
  targetCommentId: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'targetUserId must not contain only whitespaces' })
  targetUserId: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'content must not contain only whitespaces' })
  content: string;
}
