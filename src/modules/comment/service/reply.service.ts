import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
import { UserRepository } from '../../user/repository/user.repository';
import { CreateReplyDto } from '../dto/create-reply.dto';
import { UserDocument } from '../../user/schema/users.schema';
import { ReplyDocument } from '../schema/reply.schema';
import { ReplyRepository } from '../repository/reply.repository';
import { UpdateReplyDto } from '../dto/update-reply.dto';
import { Response } from 'express';
import mongoose from 'mongoose';

@Injectable()
export class ReplyService {
  constructor(
    private readonly replyRepository: ReplyRepository,
    private readonly commentRepository: CommentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async createReply(
    replyData: CreateReplyDto,
    user: UserDocument,
  ): Promise<ReplyDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const [existingComment, existingUser] = await Promise.all([
      this.commentRepository.findOneById(replyData.targetCommentId),
      this.userRepository.findById(replyData.targetUserId),
    ]);

    if (!existingComment) {
      throw new NotFoundException('This comment does not exist');
    }

    if (!existingUser) {
      throw new NotFoundException('This user does not exist');
    }

    return await this.replyRepository.createReply(replyData, user);
  }

  public async updateReply(
    updateReplyData: UpdateReplyDto,
    user: UserDocument,
  ): Promise<ReplyDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const { replyId } = updateReplyData;
    const existingReply = await this.replyRepository.findOneById(replyId);

    if (!existingReply) {
      throw new NotFoundException('This reply does not exist');
    }

    if (!this.isOwner(user, existingReply)) {
      throw new UnauthorizedException('Not allowed to edit this reply');
    }

    return await this.replyRepository.updateReply(updateReplyData);
  }

  public async deleteReply(
    replyId: string,
    user: UserDocument,
    res: Response,
  ): Promise<void> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingReply = await this.replyRepository.findOneById(replyId);
    if (!existingReply) {
      throw new NotFoundException('This reply does not exist');
    }
    if (!this.isOwner(user, existingReply)) {
      throw new UnauthorizedException('Not allowed to delete this reply');
    }

    await this.replyRepository.deleteReply(replyId);
    res.json({ msg: 'The reply is deleted' });
  }

  public async getAllCommentsOfLocation(
    commentId: string,
    user: UserDocument,
    next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
    remaining: number;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingComment = await this.commentRepository.findOneById(commentId);
    if (!existingComment) {
      throw new NotFoundException('This comment does not exist');
    }

    const queryObject = {
      targetCommentId: new mongoose.Types.ObjectId(commentId),
    };
    return await this.replyRepository.getRepliesOfComment(
      queryObject,
      next_cursor,
      user,
    );
  }

  public isOwner(user: UserDocument, existingReply: ReplyDocument): boolean {
    return String(user._id) === String(existingReply.userId);
  }
}
