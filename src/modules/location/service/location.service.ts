import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LocationRepository } from '../repository/location.repository';
import { CreateLocationDto, Period } from '../dto/create-location.dto';
import { LocationDocument } from '../schema/locations.schema';
import { UserDocument } from '../../user/schema/users.schema';

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
    
    const { name, address, periods } = locationData;
    if (!this.validatePeriods(periods)) {
      throw new BadRequestException('Open time must be before close time');
    }

    const isDuplicate = await this.locationRepository.isDuplicate(
      name,
      address,
    );
    if (isDuplicate) {
      throw new BadRequestException('This location is already created');
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

  private validatePeriods(periods: [Period]): boolean {
    for (let period of periods) {
      if (!this.validatePeriod(period)) {
        return false;
      }
    }

    return true;
  }

  private validatePeriod(period: Period) {
    return period.openTime < period.closeTime;
  }
}
