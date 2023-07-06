import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reply, ReplyDocument } from '../schema/reply.schema';
import mongoose, { Model } from 'mongoose';
import { CreateReplyDto } from '../dto/create-reply.dto';
import { UserDocument } from '../../user/schema/users.schema';
import { CommonConstant } from '../../../common/constant';

@Injectable()
export class ReplyRepository {
  constructor(
    @InjectModel(Reply.name)
    private readonly replyModel: Model<ReplyDocument>,
  ) {}

  public async createReply(
    createReplyDto: CreateReplyDto,
    user: UserDocument,
  ): Promise<ReplyDocument> {
    return await this.replyModel.create({
      ...createReplyDto,
      userId: user._id,
    });
  }

  public async updateReply(updateReplyData: any): Promise<ReplyDocument> {
    return await this.replyModel.findOneAndUpdate(
      {
        _id: updateReplyData.replyId,
      },
      {
        ...updateReplyData,
      },
      { new: true },
    );
  }

  public async deleteReply(replyId: string): Promise<void> {
    await this.replyModel.deleteOne({ _id: replyId });
  }

  public async removeRepliesOfComment(commentId: string): Promise<void> {
    await this.replyModel.deleteMany({ targetCommentId: commentId });
  }

  public async findOneById(replyId: string): Promise<ReplyDocument> {
    return await this.replyModel.findById(replyId);
  }

  public async getRepliesOfComment(
    queryObject: any,
    next_cursor: string,
    user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
    remaining: number;
  }> {
    let sortingQuery = { createdAt: 1, _id: 1 };
    if (next_cursor) {
      const decodedFromNextCursor = Buffer.from(next_cursor, 'base64')
        .toString('ascii')
        .split('_');

      const [createdAt, _id] = decodedFromNextCursor;
      queryObject.createdAt = { $gte: new Date(createdAt) };
      queryObject._id = { $gt: new mongoose.Types.ObjectId(_id) };
    }

    let filterPipelineStage: any[] = [
      {
        $sort: sortingQuery,
      },
      {
        $match: queryObject,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'targetUserId',
          foreignField: '_id',
          as: 'targetUser',
        },
      },
      {
        $unwind: {
          path: '$targetUser',
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $lookup: {
      //     from: 'likecomments',
      //     let: { commentId: '$_id' },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             // use this operator to compare 2 fields in the same joined collections
      //             $and: [
      //               { $eq: ['$commentId', '$$commentId'] },
      //               {
      //                 $eq: ['$userId', user._id],
      //               },
      //             ],
      //           },
      //         },
      //       },
      //     ],
      //     as: 'likes',
      //   },
      // },
      // {
      //   $addFields: {
      //     likedByUser: {
      //       $cond: [{ $gt: [{ $size: '$likes' }, 0] }, true, false],
      //     },
      //   },
      // },
      {
        $limit: CommonConstant.REPLY_PAGINATION_LIMIT,
      },
      {
        $project: {
          locationId: 0,
          // likes: 0,
          user: {
            isVerified: 0,
            locationCategories: 0,
            searchDistance: 0,
          },
          targetUser: {
            isVerified: 0,
            locationCategories: 0,
            searchDistance: 0,
            email: 0,
            imageUrl: 0,
          },
        },
      },
    ];

    let countPipelineStage: any[] = [
      {
        $match: queryObject,
      },
      {
        $group: {
          _id: null,
          numOfResults: { $sum: 1 },
        },
      },
    ];

    let results: any[] = await this.replyModel.aggregate(filterPipelineStage);

    const totalMatchResults = await this.replyModel.aggregate(
      countPipelineStage,
    );
    const count = totalMatchResults[0]?.numOfResults || 0;

    next_cursor = null;
    if (count > results.length) {
      const lastResult = results[results.length - 1];
      next_cursor = Buffer.from(
        lastResult.createdAt.toISOString() + '_' + lastResult._id,
      ).toString('base64');
    }

    return {
      results,
      next_cursor,
      remaining: count - results.length,
    };
  }
}
