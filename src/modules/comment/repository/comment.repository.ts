import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { Comment, CommentDocument } from '../schema/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UserDocument } from 'src/modules/user/schema/users.schema';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommonConstant } from '../../../common/constant';

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

  public async findOneById(commentId: string): Promise<CommentDocument> {
    return await this.commentModel.findById(commentId);
  }

  public async getCommentsOfLocation(
    queryObject: any,
    next_cursor: string,
    user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    let sortingQuery = { heartCount: -1, createdAt: 1, _id: 1 };
    if (next_cursor) {
      const decodedFromNextCursor = Buffer.from(next_cursor, 'base64')
        .toString('ascii')
        .split('_');

      const [heartCount, createdAt, _id] = decodedFromNextCursor;
      // query object in aggregate must be casted manually
      queryObject.$or = [
        { heartCount: { $lt: parseInt(heartCount, 10) } },
        {
          heartCount: parseInt(heartCount, 10),
          createdAt: { $gte: new Date(createdAt) },
          _id: { $gt: new mongoose.Types.ObjectId(_id) },
        },
      ];
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
          from: 'likecomments',
          let: { commentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  // use this operator to compare 2 fields in the same joined collections
                  $and: [
                    { $eq: ['$commentId', '$$commentId'] },
                    {
                      $eq: ['$userId', user._id],
                    },
                  ],
                },
              },
            },
          ],
          as: 'likes',
        },
      },
      {
        $addFields: {
          likedByUser: {
            $cond: [{ $gt: [{ $size: '$likes' }, 0] }, true, false],
          },
        },
      },
      {
        $limit: CommonConstant.COMMENT_PAGINATION_LIMIT,
      },
      {
        $project: {
          locationId: 0,
          likes: 0,
          user: {
            isVerified: 0,
            locationCategories: 0,
            searchDistance: 0,
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

    let results: any[] = await this.commentModel.aggregate(filterPipelineStage);

    const totalMatchResults = await this.commentModel.aggregate(
      countPipelineStage,
    );
    const count = totalMatchResults[0]?.numOfResults || 0;

    next_cursor = null;
    if (count > results.length) {
      const lastResult = results[results.length - 1];
      next_cursor = Buffer.from(
        lastResult.heartCount +
          '_' +
          lastResult.createdAt.toISOString() +
          '_' +
          lastResult._id,
      ).toString('base64');
    }

    return {
      results,
      next_cursor,
    };
  }
}
