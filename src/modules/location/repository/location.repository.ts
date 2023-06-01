import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from '../schema/locations.schema';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UserDocument } from '../../user/schema/users.schema';
import { CommonConstant } from '../../../common/constant';

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

  public async findCreatedLocations(
    queryObject: any,
    next_cursor: string,
  ): Promise<{
    results: any;
    next_cursor: string;
  }> {
    if (next_cursor) {
      const [createdAt, _id] = Buffer.from(next_cursor, 'base64')
        .toString('ascii')
        .split('_');

      queryObject.createdAt = { $lte: createdAt };
      queryObject._id = { $lt: _id };
    }

    let locations = this.locationModel.find(queryObject);
    locations = locations.sort('-createdAt -_id');

    let results: any[] = await locations;
    next_cursor = null;
    if (results.length > CommonConstant.LOCATION_PAGINATION_LIMIT) {
      const lastResult = results[CommonConstant.LOCATION_PAGINATION_LIMIT - 1];
      next_cursor = Buffer.from(
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
