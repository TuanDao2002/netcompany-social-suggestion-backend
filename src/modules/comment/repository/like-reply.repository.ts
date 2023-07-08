import { Injectable } from '@nestjs/common';
import { LikeReply, LikeReplyDocument } from '../schema/like-reply.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reply, ReplyDocument } from '../schema/reply.schema';
import { UserDocument } from '../../user/schema/users.schema';

@Injectable()
export class LikeReplyRepository {
  constructor(
    @InjectModel(LikeReply.name)
    private likeReplyModel: Model<LikeReplyDocument>,

    @InjectModel(Reply.name)
    private replyModel: Model<ReplyDocument>,
  ) {}

  public async findLike(
    user: UserDocument,
    replyId: string,
  ): Promise<LikeReply> {
    return await this.likeReplyModel.findOne({
      userId: user._id,
      replyId,
    });
  }

  public async create(user: UserDocument, replyId: string): Promise<LikeReply> {
    const createdLike = new this.likeReplyModel({
      userId: user._id,
      replyId,
    });
    await this.replyModel.updateOne(
      { _id: replyId },
      { $inc: { heartCount: 1 } },
    );
    return createdLike.save();
  }

  public async delete(user: UserDocument, replyId: string): Promise<void> {
    await this.replyModel.updateOne(
      { _id: replyId },
      { $inc: { heartCount: -1 } },
    );
    await this.likeReplyModel.deleteOne({
      userId: user._id,
      replyId,
    });
  }

  public async removeLikesReply(replyId: string): Promise<void> {
    await this.likeReplyModel.deleteMany({ replyId });
  }
}
