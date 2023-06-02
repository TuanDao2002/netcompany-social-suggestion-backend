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

@Injectable()
export class LocationService {
  constructor(private readonly locationRepository: LocationRepository) {}

  public async createLocation(
    locationData: CreateLocationDto,
    user: UserDocument,
  ): Promise<LocationDocument> {
    if (!user) {
      throw new UnauthorizedException('You have to sign in to create location');
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
  ) {
    const { locationId, placeId, name, address, description } =
      updateLocationData;
    const existingLocation = await this.locationRepository.findOneById(
      locationId,
    );
    if (!existingLocation) {
      throw new BadRequestException('This location does not exist');
    }

    if (String(user._id) !== String(existingLocation.createdUser.userId)) {
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

  public async viewCreatedLocation(
    next_cursor: string,
    user: UserDocument,
  ): Promise<{
    results: any;
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have to sign in to create location');
    }

    const queryObject = { 'createdUser.userId': user._id };
    return await this.locationRepository.findCreatedLocations(
      queryObject,
      next_cursor,
    );
  }
}
