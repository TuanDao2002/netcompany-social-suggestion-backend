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

@Injectable()
export class LocationService {
  constructor(private readonly locationRepository: LocationRepository) {}

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
      throw new BadRequestException('This location does not exist');
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
  ): Promise<void> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingLocation = await this.locationRepository.findOneById(
      locationId,
    );
    if (!existingLocation) {
      throw new BadRequestException('This location does not exist');
    }

    if (!this.isOwner(user, existingLocation)) {
      throw new UnauthorizedException('Not allowed to delete this location');
    }

    await this.locationRepository.deleteLocation(locationId);
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
    return await this.locationRepository.viewLocations(
      queryObject,
      next_cursor,
    );
  }

  public async viewLatestLocation(
    next_cursor: string,
    latitude: number,
    longitude: number,
    user: UserDocument,
  ): Promise<{
    results: any;
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    if (!latitude || !longitude) {
      throw new BadRequestException(
        'You have not sent coordinates to search locations',
      );
    }

    let queryObject: any = {};
    const { locationCategories, searchDistance } = user;
    if (locationCategories.length > 0) {
      queryObject.locationCategory = { $in: locationCategories };
    }

    if (searchDistance > 0) {
      queryObject.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: searchDistance * 1000,
        },
      };
    }

    return await this.locationRepository.viewLocations(
      queryObject,
      next_cursor,
    );
  }

  public async viewFeaturedLocation(
    next_cursor: string,
    latitude: number,
    longitude: number,
    user: UserDocument,
  ): Promise<{
    results: any;
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    if (!latitude || !longitude) {
      throw new BadRequestException(
        'You have not sent coordinates to search locations',
      );
    }

    let queryObject: any = {};
    const { locationCategories, searchDistance } = user;
    if (locationCategories.length > 0) {
      queryObject.locationCategory = { $in: locationCategories };
    }

    if (searchDistance > 0) {
      queryObject.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: searchDistance * 1000,
        },
      };
    }

    return await this.locationRepository.viewLocations(
      queryObject,
      next_cursor,
      true,
    );
  }

  public async filterLocation(
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

    const {
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
      queryObject.locationCategory = locationCategory;
    }

    let periodQuery: any[] = [];

    if (weekday && weekday.openTime && weekday.closeTime) {
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
                    $expr: {
                      $lte: ['$weekday.openTime', weekday.openTime],
                    },
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
                    $expr: {
                      $lte: ['$weekend.openTime', weekend.openTime],
                    },
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

    if (latitude && longitude && searchDistance) {
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
      locationQuery,
      queryObject,
      next_cursor,
      user,
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
