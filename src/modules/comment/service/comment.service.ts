import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { LocationRepository } from 'src/modules/location/repository/location.repository';
import { UserDocument } from 'src/modules/user/schema/users.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentRepository } from '../repository/comment.repository';
import { CommentDocument } from '../schema/comment.schema';
import mongoose from 'mongoose';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly locationRepository: LocationRepository,
  ) {}

  public async createComment(
    commentData: CreateCommentDto,
    user: UserDocument,
  ): Promise<CommentDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingLocation = await this.locationRepository.findOneById(
      commentData.locationId,
    );
    if (!existingLocation) {
      throw new NotFoundException('This location does not exist');
    }

    return await this.commentRepository.createComment(commentData, user);
  }

  public async updateComment(
    updateCommentData: UpdateCommentDto,
    user: UserDocument,
  ): Promise<CommentDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const { commentId } = updateCommentData;
    const existingComment = await this.commentRepository.findOneById(commentId);

    if (!existingComment) {
      throw new NotFoundException('This comment does not exist');
    }

    if (!this.isOwner(user, existingComment)) {
      throw new UnauthorizedException('Not allowed to edit this comment');
    }

    return await this.commentRepository.updateComment(updateCommentData);
  }

  public async deleteComment(
    commentId: string,
    user: UserDocument,
    res: Response,
  ) {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingComment = await this.commentRepository.findOneById(commentId);
    if (!existingComment) {
      throw new NotFoundException('This comment does not exist');
    }
    if (!this.isOwner(user, existingComment)) {
      throw new UnauthorizedException('Not allowed to delete this comment');
    }

    await this.commentRepository.deleteComment(commentId);
    res.json({ msg: 'The comment is deleted' });
  }

  public async getAllCommentsOfLocation(
    locationId: string,
    user: UserDocument,
    next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingLocation = await this.locationRepository.findOneById(
      locationId,
    );
    if (!existingLocation) {
      throw new NotFoundException('This location does not exist');
    }

    const queryObject = { locationId: new mongoose.Types.ObjectId(locationId) };
    return await this.commentRepository.getCommentsOfLocation(
      queryObject,
      next_cursor,
      user,
    );
  }

  public isOwner(
    user: UserDocument,
    existingComment: CommentDocument,
  ): boolean {
    return String(user._id) === String(existingComment.userId);
  }
}
