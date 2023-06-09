import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  LikeLocation,
  LikeLocationDocument,
} from '../schema/like-location.schema';
import { Model } from 'mongoose';
import { UserDocument } from '../../user/schema/users.schema';
import { Location, LocationDocument } from '../schema/locations.schema';
import { CommonConstant } from '../../../common/constant';

@Injectable()
export class LikeLocationRepository {
  constructor(
    @InjectModel(LikeLocation.name)
    private likeLocationModel: Model<LikeLocationDocument>,

    @InjectModel(Location.name)
    private locationModel: Model<LocationDocument>,
  ) {}

  public async findLike(
    user: UserDocument,
    locationId: string,
  ): Promise<LikeLocation> {
    return await this.likeLocationModel.findOne({
      userId: user._id,
      locationId,
    });
  }

  public async create(
    user: UserDocument,
    locationId: string,
  ): Promise<LikeLocation> {
    const createdLike = new this.likeLocationModel({
      userId: user._id,
      locationId,
    });
    await this.locationModel.updateOne(
      { _id: locationId },
      { $inc: { heartCount: 1 } },
    );
    return createdLike.save();
  }

  public async delete(user: UserDocument, locationId: string): Promise<void> {
    await this.locationModel.updateOne(
      { _id: locationId },
      { $inc: { heartCount: -1 } },
    );
    await this.likeLocationModel.deleteOne({
      userId: user._id,
      locationId,
    });
  }

  public async findLikedLocationsByUser(
    queryObject: any,
    next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    if (next_cursor) {
      const decodedFromNextCursor = Buffer.from(next_cursor, 'base64')
        .toString('ascii')
        .split('_');

      const [createdAt, _id] = decodedFromNextCursor;
      queryObject.createdAt = { $lte: createdAt };
      queryObject._id = { $lt: _id };
    }

    let likedLocations = this.likeLocationModel
      .find(queryObject)
      .populate('locationId', '_id name address imageUrls heartCount createdAt')
      .select('-userId');
    likedLocations = likedLocations.sort('-createdAt -_id');
    likedLocations = likedLocations.limit(
      CommonConstant.LOCATION_PAGINATION_LIMIT,
    );

    let results: any[] = await likedLocations;

    const count = await this.likeLocationModel.count(queryObject);
    next_cursor = null;
    if (count > results.length) {
      const lastResult = results[results.length - 1];
      next_cursor = Buffer.from(
        lastResult.createdAt.toISOString() + '_' + lastResult._id,
      ).toString('base64');
    }
    
    results = results.map((res) => res.locationId);

    return {
      results,
      next_cursor,
    };
  }
}
