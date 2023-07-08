import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LikeReplyRepository } from '../repository/like-reply.repository';
import { ReplyRepository } from '../repository/reply.repository';
import { UserDocument } from '../../user/schema/users.schema';
import { LikeReply } from '../schema/like-reply.schema';

@Injectable()
export class LikeReplyService {
  constructor(
    private readonly likeReplyRepository: LikeReplyRepository,
    private readonly replyRepository: ReplyRepository,
  ) {}

  public async likeReply(
    replyId: string,
    user: UserDocument,
  ): Promise<LikeReply> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingLike = await this.likeReplyRepository.findLike(user, replyId);
    if (existingLike) {
      throw new BadRequestException('You already liked this reply');
    }

    const existingReply = await this.replyRepository.findOneById(replyId);
    if (!existingReply) {
      throw new NotFoundException('This reply does not exist');
    }

    return await this.likeReplyRepository.create(user, replyId);
  }

  public async unlikeReply(replyId: string, user: UserDocument): Promise<void> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingLike = await this.likeReplyRepository.findLike(user, replyId);
    if (!existingLike) {
      throw new BadRequestException('You did not like this reply');
    }

    const existingReply = await this.replyRepository.findOneById(replyId);
    if (!existingReply) {
      throw new NotFoundException('This reply does not exist');
    }

    await this.likeReplyRepository.delete(user, replyId);
  }
}
