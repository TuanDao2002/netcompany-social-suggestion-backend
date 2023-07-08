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
import { CommentService } from '../service/comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentDocument } from '../schema/comment.schema';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { Response } from 'express';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { LikeComment } from '../schema/like-comment.schema';
import { LikeCommentService } from '../service/like-comment.service';

@Controller('comment')
@UseGuards(JwtGuard)
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly likeCommentService: LikeCommentService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('')
  async createComment(
    @Body() body: CreateCommentDto,
    @CurrentUser() user: UserDocument,
  ): Promise<CommentDocument> {
    return await this.commentService.createComment(body, user);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('')
  async updateComment(
    @Body() body: UpdateCommentDto,
    @CurrentUser() user: UserDocument,
  ): Promise<CommentDocument> {
    return await this.commentService.updateComment(body, user);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ): Promise<void> {
    await this.commentService.deleteComment(commentId, user, res);
  }

  @HttpCode(HttpStatus.OK)
  @Get('location/:locationId')
  async viewAllCommentsOfLocation(
    @Param('locationId') locationId: string,
    @CurrentUser() user: UserDocument,
    @Query('next_cursor') next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    return await this.commentService.getAllCommentsOfLocation(
      locationId,
      user,
      next_cursor,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('like/:id')
  async likeComment(
    @Param('id') commentId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<LikeComment> {
    return await this.likeCommentService.likeComment(commentId, user);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('like/:id')
  async unlikeComment(
    @Param('id') commentId: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ): Promise<void> {
    await this.likeCommentService.unlikeComment(commentId, user);
    res.json({ msg: 'You unliked this comment' });
  }
}
