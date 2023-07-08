import { IsNotEmpty, IsString } from 'class-validator';
import { IsNotBlank } from '../../../common/validator';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'commentId must not contain only whitespaces' })
  commentId: string;

  @IsString()
  @IsNotEmpty()
  @IsNotBlank({ message: 'content must not contain only whitespaces' })
  content: string;
}
