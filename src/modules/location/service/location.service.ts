import {
  BadRequestException,
  Injectable,
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

    const { locationCategories, searchDistance } = user;

    const queryObject = {
      locationCategory: { $in: locationCategories },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: searchDistance * 1000,
        },
      },
    };
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

    const { locationCategories, searchDistance } = user;

    const queryObject = {
      locationCategory: { $in: locationCategories },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: searchDistance * 1000,
        },
      },
    };
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
  ) {
    const { searchInput, locationCategory, weekday, weekend, searchDistance } =
      queryParams;

    let queryObject: any = {};
    const formattedSearchInput = Utils.removeSpace(
      searchInput.replace(/[^a-z0-9 ]/gi, ''),
    );
    if (formattedSearchInput) {
      const regexPattern = `.*${formattedSearchInput.split(' ').join('.*')}.*`;
      queryObject.nameAddress = { $regex: `${regexPattern}`, $options: 'i' };
    }

    if (locationCategory) {
      queryObject.locationCategory = locationCategory;
    }

    const results = await this.locationRepository.filterLocation(
      queryObject,
      next_cursor,
      user,
    );

    return { results, queryParams };
  }

  public isOwner(
    user: UserDocument,
    existingLocation: LocationDocument,
  ): boolean {
    return String(user._id) === String(existingLocation.userId);
  }
}
