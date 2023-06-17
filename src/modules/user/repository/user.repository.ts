import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schema/users.schema';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { VerifyUserDto } from '../dto/verify-user.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { CommonConstant } from '../../../common/constant';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  public async findByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ username, isVerified: true }).exec();
  }

  public async validateNewUser(
    email: string,
  ): Promise<UserDocument> {
    return await this.userModel.findOne({
      $and: [{ isVerified: true }, { email }],
    });
  }

  public async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  public async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  public async updateByEmail(
    email: string,
    verifyUserDto: VerifyUserDto,
    isVerified: boolean = true,
  ): Promise<UserDocument> {
    return await this.userModel.findOneAndUpdate(
      { email },
      {
        isVerified,
        ...verifyUserDto,
      },
      { new: true },
    );
  }

  public async updateById(
    id: string,
    updateData: UpdateUserProfileDto,
  ): Promise<UserDocument> {
    return await this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }

  public async filterUser(
    queryObject: any,
    next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    let sortingQuery = { createdAt: -1, _id: -1 };
    if (next_cursor) {
      const decodedFromNextCursor = Buffer.from(next_cursor, 'base64')
        .toString('ascii')
        .split('_');

      const [createdAt, _id] = decodedFromNextCursor;
      queryObject.createdAt = { $lte: new Date(createdAt) };
      queryObject._id = { $lt: new mongoose.Types.ObjectId(_id) };
    }

    let filterPipelineStage: any[] = [
      {
        $sort: sortingQuery,
      },
      {
        $match: queryObject,
      },
      {
        $limit: CommonConstant.USER_PAGINATION_LIMIT,
      },
      {
        $project: {
          locationCategories: 0,
          searchDistance: 0,
          isVerified: 0,
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

    let results: any[] = await this.userModel.aggregate(filterPipelineStage);

    const totalMatchResults = await this.userModel.aggregate(
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
    };
  }
}
