import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  LikeComment,
  LikeCommentDocument,
} from '../schema/like-comment.schema';
import { Comment, CommentDocument } from '../schema/comment.schema';
import { Model } from 'mongoose';
import { UserDocument } from '../../user/schema/users.schema';

@Injectable()
export class LikeCommentRepository {
  constructor(
    @InjectModel(LikeComment.name)
    private likeCommentModel: Model<LikeCommentDocument>,

    @InjectModel(Comment.name)
    private commentModel: Model<CommentDocument>,
  ) {}

  public async findLike(
    user: UserDocument,
    commentId: string,
  ): Promise<LikeComment> {
    return await this.likeCommentModel.findOne({
      userId: user._id,
      commentId,
    });
  }

  public async create(
    user: UserDocument,
    commentId: string,
  ): Promise<LikeComment> {
    const createdLike = new this.likeCommentModel({
      userId: user._id,
      commentId,
    });
    await this.commentModel.updateOne(
      { _id: commentId },
      { $inc: { heartCount: 1 } },
    );
    return createdLike.save();
  }

  public async delete(user: UserDocument, commentId: string): Promise<void> {
    await this.commentModel.updateOne(
      { _id: commentId },
      { $inc: { heartCount: -1 } },
    );
    await this.likeCommentModel.deleteOne({
      userId: user._id,
      commentId,
    });
  }

  public async removeLikesComment(commentId: string): Promise<void> {
    await this.likeCommentModel.deleteMany({ commentId });
  }
}
