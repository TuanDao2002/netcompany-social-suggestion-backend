import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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
      userId: user._id,
      nameAddress: `${createLocationDto.name} ${createLocationDto.address}`,
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
      {
        updateLocationData,
        nameAddress: `${updateLocationData.name} ${updateLocationData.address}`,
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
    results: any[];
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

    let locations = this.locationModel
      .find(queryObject)
      .select('_id name address imageUrls heartCount createdAt');
    locations = sortByHeartCount
      ? locations.sort('-heartCount -createdAt -_id')
      : locations.sort('-createdAt -_id');
    locations = locations.limit(CommonConstant.LOCATION_PAGINATION_LIMIT);
    let results: any[] = await locations;

    const count = await this.locationModel.count(queryObject);
    next_cursor = null;
    if (count > results.length) {
      const lastResult = results[results.length - 1];
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
    }

    return {
      results,
      next_cursor,
    };
  }

  public async filterLocation(
    locationQuery: any,
    queryObject: any,
    next_cursor: string,
    user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
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
          createdAt: { $lte: new Date(createdAt) },
          _id: { $lt: new mongoose.Types.ObjectId(_id) },
        },
      ];
    }

    let filterPipelineStage: any[] = [
      {
        $sort: { heartCount: -1, createdAt: -1, _id: -1 },
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
        $unwind: '$user',
      },
      {
        $limit: CommonConstant.LOCATION_PAGINATION_LIMIT,
      },
      {
        $project: {
          nameAddress: 0,
          user: { isVerified: 0, locationCategories: 0, searchDistance: 0 },
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

    if (Object.keys(locationQuery).length > 0) {
      filterPipelineStage.unshift(locationQuery);
      countPipelineStage.unshift(locationQuery);
    }

    let results: any[] = await this.locationModel.aggregate(
      filterPipelineStage,
    );

    const totalMatchResults = await this.locationModel.aggregate(
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

  public async findDetailLocation(locationId: string): Promise<any[]> {
    return await this.locationModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(locationId) },
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
        $unwind: '$user',
      },
      {
        $limit: 1,
      },
      {
        $project: {
          nameAddress: 0,
          user: { isVerified: 0, locationCategories: 0, searchDistance: 0 },
        },
      },
    ]);
  }
}
