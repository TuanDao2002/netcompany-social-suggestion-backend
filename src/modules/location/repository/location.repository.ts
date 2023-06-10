import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Location, LocationDocument } from '../schema/locations.schema';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UserDocument } from '../../user/schema/users.schema';
import { CommonConstant } from '../../../common/constant';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { LocationSortingType } from '../../../common/location-sortring-type.enum';

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
        ...updateLocationData,
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

  public async filterLocation(
    sortType: LocationSortingType,
    locationQuery: any,
    queryObject: any,
    next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    let sortingQuery: any = {};
    if (sortType === LocationSortingType.FEATURED) {
      sortingQuery = { heartCount: -1, createdAt: -1, _id: -1 };
    } else {
      sortingQuery = { createdAt: -1, _id: -1 };
    }

    if (next_cursor) {
      const decodedFromNextCursor = Buffer.from(next_cursor, 'base64')
        .toString('ascii')
        .split('_');

      if (sortType === LocationSortingType.FEATURED) {
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
      } else if (sortType === LocationSortingType.LATEST) {
        const [createdAt, _id] = decodedFromNextCursor;
        queryObject.createdAt = { $lte: new Date(createdAt) };
        queryObject._id = { $lt: new mongoose.Types.ObjectId(_id) };
      }
    }

    let filterPipelineStage: any[] = [
      {
        $sort: sortingQuery,
      },
      {
        $match: queryObject,
      },
      {
        $limit: CommonConstant.LOCATION_PAGINATION_LIMIT,
      },
      {
        $project: {
          nameAddress: 0,
          description: 0,
          placeId: 0,
          location: 0,
          pricePerPerson: 0,
          locationCategory: 0,
          weekday: 0,
          weekend: 0,
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
      if (sortType === LocationSortingType.FEATURED) {
        next_cursor = Buffer.from(
          lastResult.heartCount +
            '_' +
            lastResult.createdAt.toISOString() +
            '_' +
            lastResult._id,
        ).toString('base64');
      } else if (sortType === LocationSortingType.LATEST) {
        next_cursor = Buffer.from(
          lastResult.createdAt.toISOString() + '_' + lastResult._id,
        ).toString('base64');
      }
    }

    return {
      results,
      next_cursor,
    };
  }

  public async findDetailLocation(
    locationId: string,
    user: UserDocument,
  ): Promise<any[]> {
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
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: 'likelocations',
          let: { locationId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  // use this operator to compare 2 fields in the same joined collections
                  $and: [
                    { $eq: ['$locationId', '$$locationId'] },
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
        $project: {
          nameAddress: 0,
          user: { isVerified: 0, locationCategories: 0, searchDistance: 0 },
          likes: 0,
        },
      },
    ]);
  }
}
