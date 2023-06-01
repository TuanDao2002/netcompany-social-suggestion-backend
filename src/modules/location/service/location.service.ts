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
    locationData.address = Utils.removeZipcode(locationData.address);
    locationData.name = Utils.removeSpace(locationData.name);
    locationData.description = locationData.description.trim();

    const { name, address } = locationData;
    const isDuplicate = await this.locationRepository.isDuplicate(
      name,
      address,
    );
    if (isDuplicate) {
      throw new BadRequestException(
        `Location with name: '${name}' and address: '${address}' is already registered`,
      );
    }

    return await this.locationRepository.createLocation(locationData, user);
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
