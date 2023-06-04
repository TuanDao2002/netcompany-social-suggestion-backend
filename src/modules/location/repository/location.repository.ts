import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from '../schema/locations.schema';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UserDocument } from '../../user/schema/users.schema';
import { CommonConstant } from '../../../common/constant';
import { UpdateLocationDto } from '../dto/update-location.dto';

@Injectable()
export class LocationRepository {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
  ) {}

  public async createLocation(
    createLocationDto: CreateLocationDto,
    user: UserDocument,
  ): Promise<LocationDocument> {
    const createdLocation = new this.locationModel({
      ...createLocationDto,
      createdUser: {
        userId: user._id,
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl,
      },
    });
    return createdLocation.save();
  }

  public async findOneById(locationId: string): Promise<LocationDocument> {
    return await this.locationModel.findById(locationId);
  }

  public async updateLocation(
    updateLocationData: UpdateLocationDto,
  ): Promise<LocationDocument> {
    return await this.locationModel.findOneAndUpdate(
      {
        _id: updateLocationData.locationId,
      },
      updateLocationData,
      { new: true },
    );
  }

  public async updateLocationCreator(updateUser: UserDocument): Promise<void> {
    await this.locationModel.updateMany(
      { 'createdUser.userId': updateUser._id },
      {
        $set: {
          'createdUser.username': updateUser.username,
          'createdUser.imageUrl': updateUser.imageUrl,
        },
      },
      { new: true },
    );
  }

  public async deleteLocation(locationId: string): Promise<void> {
    await this.locationModel.deleteOne({ _id: locationId });
  }

  public async findDuplicate(
    name: string,
    placeId: string,
  ): Promise<{
    name: string;
    address: string;
  }> {
    const duplicateLocation = await this.locationModel.findOne({
      name,
      placeId,
    });

    return duplicateLocation
      ? { name: duplicateLocation.name, address: duplicateLocation.address }
      : null;
  }

  public async viewLocations(
    queryObject: any,
    next_cursor: string,
    sortByHeartCount: boolean = false,
  ): Promise<{
    results: any;
    next_cursor: string;
  }> {
    if (next_cursor) {
      const decodedFromNextCursor = Buffer.from(next_cursor, 'base64')
        .toString('ascii')
        .split('_');
      if (sortByHeartCount) {
        // if sort by heart count
        const [heartCount, createdAt, _id] = decodedFromNextCursor;
        queryObject.$or = [
          { heartCount: { $lt: heartCount } },
          {
            heartCount: heartCount,
            createdAt: { $lte: createdAt },
            _id: { $lt: _id },
          },
        ];
      } else {
        // otherwise, sort by default to find latest
        const [createdAt, _id] = decodedFromNextCursor;
        queryObject.createdAt = { $lte: createdAt };
        queryObject._id = { $lt: _id };
      }
    }

    let locations = this.locationModel.find(queryObject);
    locations = sortByHeartCount
      ? locations.sort('-heartCount -createdAt -_id')
      : locations.sort('-createdAt -_id');

    let results: any[] = await locations;
    next_cursor = null;
    if (results.length > CommonConstant.LOCATION_PAGINATION_LIMIT) {
      const lastResult = results[CommonConstant.LOCATION_PAGINATION_LIMIT - 1];
      next_cursor = sortByHeartCount
        ? Buffer.from(
            lastResult.heartCount +
              '_' +
              lastResult.createdAt.toISOString() +
              '_' +
              lastResult._id,
          ).toString('base64')
        : Buffer.from(
            lastResult.createdAt.toISOString() + '_' + lastResult._id,
          ).toString('base64');

      results = results.slice(0, CommonConstant.LOCATION_PAGINATION_LIMIT);
    }

    return {
      results,
      next_cursor,
    };
  }
}
