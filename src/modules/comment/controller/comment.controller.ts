import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommentService } from '../service/comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentDocument } from '../schema/comment.schema';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @HttpCode(HttpStatus.OK)
  @Post('')
  async create(
    @Body() body: CreateCommentDto,
    @CurrentUser() user: UserDocument,
  ): Promise<CommentDocument> {
    return;
  }
}
