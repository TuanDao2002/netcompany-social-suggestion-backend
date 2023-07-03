import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../schema/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UserDocument } from 'src/modules/user/schema/users.schema';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  public async createComment(
    createCommentDto: CreateCommentDto,
    user: UserDocument,
  ): Promise<CommentDocument> {
    return await this.commentModel.create({
      ...createCommentDto,
      userId: user._id,
    });
  }

  public async updateComment(
    updateCommentData: UpdateCommentDto,
  ): Promise<CommentDocument> {
    return await this.commentModel.findOneAndUpdate(
      {
        _id: updateCommentData.commentId,
      },
      {
        ...updateCommentData,
      },
      { new: true },
    );
  }

  public async deleteComment(commentId: string): Promise<void> {
    await this.commentModel.deleteOne({ _id: commentId });
  }

  public async findCommentById(commentId: string): Promise<CommentDocument> {
    return await this.commentModel.findById(commentId);
  }
}
