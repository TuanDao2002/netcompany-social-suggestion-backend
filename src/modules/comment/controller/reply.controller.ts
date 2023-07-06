import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { ReplyService } from '../service/reply.service';
import { CreateReplyDto } from '../dto/create-reply.dto';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';
import { ReplyDocument } from '../schema/reply.schema';
import { UpdateReplyDto } from '../dto/update-reply.dto';
import { Response } from 'express';

@Controller('reply')
@UseGuards(JwtGuard)
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @HttpCode(HttpStatus.OK)
  @Post('')
  async createReply(
    @Body() body: CreateReplyDto,
    @CurrentUser() user: UserDocument,
  ): Promise<ReplyDocument> {
    return await this.replyService.createReply(body, user);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('')
  async updateReply(
    @Body() body: UpdateReplyDto,
    @CurrentUser() user: UserDocument,
  ): Promise<ReplyDocument> {
    return await this.replyService.updateReply(body, user);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':replyId')
  async deleteComment(
    @Param('replyId') replyId: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ): Promise<void> {
    await this.replyService.deleteReply(replyId, user, res);
  }

  @HttpCode(HttpStatus.OK)
  @Get('comment/:commentId')
  async viewAllCommentsOfLocation(
    @Param('commentId') commentId: string,
    @CurrentUser() user: UserDocument,
    @Query('next_cursor') next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
    remaining: number;
  }> {
    return await this.replyService.getAllCommentsOfLocation(
      commentId,
      user,
      next_cursor,
    );
  }
}
