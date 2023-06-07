import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  LikeLocation,
  LikeLocationDocument,
} from '../schema/like-location.schema';
import { Model } from 'mongoose';
import { UserDocument } from '../../user/schema/users.schema';
import { Location, LocationDocument } from '../schema/locations.schema';

@Injectable()
export class LikeLocationRepository {
  constructor(
    @InjectModel(LikeLocation.name)
    private likeLocationModel: Model<LikeLocationDocument>,

    @InjectModel(Location.name)
    private locationModel: Model<LocationDocument>,
  ) {}

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

  public async findLike(
    user: UserDocument,
    locationId: string,
  ): Promise<LikeLocation> {
    return await this.likeLocationModel.findOne({
      userId: user._id,
      locationId,
    });
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
}
