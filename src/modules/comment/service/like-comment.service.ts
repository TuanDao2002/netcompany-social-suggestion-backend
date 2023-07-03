import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LikeCommentRepository } from '../repository/like-comment.repository';
import { CommentRepository } from '../repository/comment.repository';
import { UserDocument } from '../../user/schema/users.schema';
import { LikeComment } from '../schema/like-comment.schema';

@Injectable()
export class LikeCommentService {
  constructor(
    private readonly likeCommentRepository: LikeCommentRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  public async likeLocation(
    commentId: string,
    user: UserDocument,
  ): Promise<LikeComment> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingLike = await this.likeCommentRepository.findLike(
      user,
      commentId,
    );
    if (existingLike) {
      throw new BadRequestException('You already liked this comment');
    }

    const existingComment = await this.commentRepository.findOneById(commentId);
    if (!existingComment) {
      throw new NotFoundException('This comment does not exist');
    }

    return await this.likeCommentRepository.create(user, commentId);
  }

  public async unlikeLocation(
    commentId: string,
    user: UserDocument,
  ): Promise<void> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingLike = await this.likeCommentRepository.findLike(
      user,
      commentId,
    );
    if (!existingLike) {
      throw new BadRequestException('You did not like this comment');
    }

    const existingLocation = await this.commentRepository.findOneById(
      commentId,
    );
    if (!existingLocation) {
      throw new NotFoundException('This comment does not exist');
    }

    await this.likeCommentRepository.delete(user, commentId);
  }
}
