import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LocationRepository } from '../repository/location.repository';
import { CreateLocationDto } from '../dto/create-location.dto';
import { LocationDocument } from '../schema/locations.schema';
import { UserDocument } from '../../user/schema/users.schema';
import { Utils } from '../../../common/utils';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { FilterLocationDto } from '../dto/filter-location.dto';
import { LocationSortingType } from '../../../common/location-sortring-type.enum';
import { Response } from 'express';
import { LikeLocationRepository } from '../repository/like-location.repository';

@Injectable()
export class LocationService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly likeLocationRepository: LikeLocationRepository,
  ) {}

  public async createLocation(
    locationData: CreateLocationDto,
    user: UserDocument,
  ): Promise<LocationDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    // format address, name and description
    locationData.address = Utils.removeSpace(locationData.address);
    locationData.name = Utils.removeSpace(locationData.name);
    locationData.description = locationData.description.trim();

    const { name, placeId } = locationData;
    const findDuplicate = await this.locationRepository.findDuplicate(
      name,
      placeId,
    );
    if (findDuplicate) {
      throw new BadRequestException(
        `Location with name: '${findDuplicate.name}' and address: '${findDuplicate.address}' is already registered`,
      );
    }

    return await this.locationRepository.createLocation(locationData, user);
  }

  public async updateLocation(
    updateLocationData: UpdateLocationDto,
    user: UserDocument,
  ): Promise<LocationDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const { locationId, placeId, name, address, description } =
      updateLocationData;
    const existingLocation = await this.locationRepository.findOneById(
      locationId,
    );
    if (!existingLocation) {
      throw new NotFoundException('This location does not exist');
    }

    if (!this.isOwner(user, existingLocation)) {
      throw new UnauthorizedException('Not allowed to edit this location');
    }

    if (
      placeId !== existingLocation.placeId ||
      name !== existingLocation.name
    ) {
      const findDuplicate = await this.locationRepository.findDuplicate(
        name,
        placeId,
      );
      if (findDuplicate) {
        throw new BadRequestException(
          `Location with name: '${findDuplicate.name}' and address: '${findDuplicate.address}' is already registered`,
        );
      }
    }

    // format address, name and description
    updateLocationData.address = Utils.removeSpace(address);
    updateLocationData.name = Utils.removeSpace(name);
    updateLocationData.description = description?.trim();

    return await this.locationRepository.updateLocation(updateLocationData);
  }

  public async deleteLocation(
    locationId: string,
    user: UserDocument,
    res: Response,
  ): Promise<void> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingLocation = await this.locationRepository.findOneById(
      locationId,
    );
    if (!existingLocation) {
      throw new NotFoundException('This location does not exist');
    }

    if (!this.isOwner(user, existingLocation)) {
      throw new UnauthorizedException('Not allowed to delete this location');
    }

    await this.locationRepository.deleteLocation(locationId);
    res.json({ msg: 'The location is deleted' });

    await this.likeLocationRepository.removeLikesOfLocation(locationId);
  }

  public async viewCreatedLocation(
    next_cursor: string,
    user: UserDocument,
  ): Promise<{
    results: any;
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const queryObject = { userId: user._id };
    return await this.locationRepository.filterLocation(
      LocationSortingType.LATEST,
      {},
      queryObject,
      next_cursor,
    );
  }

  public async searchLocationByInput(
    input: string,
    next_cursor: string,
    user: UserDocument,
  ): Promise<{
    results: any;
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    let queryObject: any = {};
    const formattedSearchInput = Utils.removeSpace(
      String(input).replace(/[^\p{L}\d\s]/giu, ''),
    );
    if (formattedSearchInput) {
      const regexPattern = `.*${formattedSearchInput.split(' ').join('.*')}.*`;
      queryObject.nameAddress = { $regex: `${regexPattern}`, $options: 'i' };
    }
    
    return await this.locationRepository.filterLocation(
      LocationSortingType.LATEST,
      {},
      queryObject,
      next_cursor,
    );
  }

  public async filterLocation(
    sortType: LocationSortingType,
    next_cursor: string,
    queryParams: FilterLocationDto,
    user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    let {
      searchInput,
      locationCategory,
      weekday,
      weekend,
      searchDistance,
      latitude,
      longitude,
    } = queryParams;

    let queryObject: any = {};
    let locationQuery: any = {};
    if (searchInput) {
      const formattedSearchInput = Utils.removeSpace(
        String(searchInput).replace(/[^\p{L}\d\s]/giu, ''),
      );
      if (formattedSearchInput) {
        const regexPattern = `.*${formattedSearchInput
          .split(' ')
          .join('.*')}.*`;
        queryObject.nameAddress = { $regex: `${regexPattern}`, $options: 'i' };
      }
    }

    if (locationCategory) {
      queryObject.locationCategory = { $in: [locationCategory] };
    } else if (user.locationCategories.length > 0) {
      queryObject.locationCategory = { $in: user.locationCategories };
    }

    let periodQuery: any[] = [];

    if (weekday && weekday.openTime && weekday.closeTime) {
      if (weekday.openTime === '0000') {
        weekday.openTime = '2400';
      }

      if (weekday.closeTime === '0000') {
        weekday.closeTime = '2400';
      }

      if (weekday.openTime === weekday.closeTime) {
        periodQuery.push({
          $expr: { $eq: ['$weekday.openTime', '$weekday.closeTime'] },
        });
      } else {
        const withinDay = weekday.openTime < weekday.closeTime;
        if (withinDay) {
          periodQuery.push({
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $lte: ['$weekday.openTime', '$weekday.closeTime'],
                    },
                  },
                  {
                    $expr: {
                      $lte: ['$weekday.openTime', weekday.openTime],
                    },
                  },
                  {
                    $expr: {
                      $gte: ['$weekday.closeTime', weekday.closeTime],
                    },
                  },
                ],
              },
              {
                $and: [
                  {
                    $expr: {
                      $gte: ['$weekday.openTime', '$weekday.closeTime'],
                    },
                  },
                  {
                    $or: [
                      {
                        $expr: {
                          $lte: ['$weekday.openTime', weekday.openTime],
                        },
                      },
                      {
                        $expr: {
                          $gte: ['$weekday.closeTime', weekday.closeTime],
                        },
                      },
                    ],
                  },
                ],
              },
              { $expr: { $eq: ['$weekday.openTime', '$weekday.closeTime'] } },
            ],
          });
        } else {
          periodQuery.push({
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $gte: ['$weekday.openTime', '$weekday.closeTime'],
                    },
                  },
                  {
                    $expr: {
                      $lte: ['$weekday.openTime', weekday.openTime],
                    },
                  },
                  {
                    $expr: {
                      $gte: ['$weekday.closeTime', weekday.closeTime],
                    },
                  },
                ],
              },
              { $expr: { $eq: ['$weekday.openTime', '$weekday.closeTime'] } },
            ],
          });
        }
      }
    }

    if (weekend && weekend.openTime && weekend.closeTime) {
      if (weekend.openTime === '0000') {
        weekend.openTime = '2400';
      }

      if (weekend.closeTime === '0000') {
        weekend.closeTime = '2400';
      }

      if (weekend.openTime === weekend.closeTime) {
        periodQuery.push({
          $expr: { $eq: ['$weekend.openTime', '$weekend.closeTime'] },
        });
      } else {
        const withinDay = weekend.openTime < weekend.closeTime;
        if (withinDay) {
          periodQuery.push({
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $lte: ['$weekend.openTime', '$weekend.closeTime'],
                    },
                  },
                  {
                    $expr: {
                      $lte: ['$weekend.openTime', weekend.openTime],
                    },
                  },
                  {
                    $expr: {
                      $gte: ['$weekend.closeTime', weekend.closeTime],
                    },
                  },
                ],
              },
              {
                $and: [
                  {
                    $expr: {
                      $gte: ['$weekend.openTime', '$weekend.closeTime'],
                    },
                  },
                  {
                    $or: [
                      {
                        $expr: {
                          $lte: ['$weekend.openTime', weekend.openTime],
                        },
                      },
                      {
                        $expr: {
                          $gte: ['$weekend.closeTime', weekend.closeTime],
                        },
                      },
                    ],
                  },
                ],
              },
              { $expr: { $eq: ['$weekend.openTime', '$weekend.closeTime'] } },
            ],
          });
        } else {
          periodQuery.push({
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $gte: ['$weekend.openTime', '$weekend.closeTime'],
                    },
                  },
                  {
                    $expr: {
                      $lte: ['$weekend.openTime', weekend.openTime],
                    },
                  },
                  {
                    $expr: {
                      $gte: ['$weekend.closeTime', weekend.closeTime],
                    },
                  },
                ],
              },
              { $expr: { $eq: ['$weekend.openTime', '$weekend.closeTime'] } },
            ],
          });
        }
      }
    }

    if (periodQuery.length > 0) {
      queryObject.$and = periodQuery;
    }

    if (latitude && longitude) {
      searchDistance = searchDistance || user.searchDistance;
      locationQuery.$geoNear = {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        distanceField: 'dist.calculated',
        maxDistance: searchDistance * 1000,
        spherical: true,
      };
    }

    const filteredData = await this.locationRepository.filterLocation(
      sortType,
      locationQuery,
      queryObject,
      next_cursor,
    );

    return {
      results: filteredData.results,
      next_cursor: filteredData.next_cursor,
    };
  }

  public async viewDetailLocation(
    locationId: string,
    user: UserDocument,
  ): Promise<any> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const findLocation = await this.locationRepository.findDetailLocation(
      locationId,
      user,
    );
    if (findLocation.length === 0) {
      throw new NotFoundException('This location does not exist');
    }

    return findLocation[0];
  }

  public isOwner(
    user: UserDocument,
    existingLocation: LocationDocument,
  ): boolean {
    return String(user._id) === String(existingLocation.userId);
  }
}
