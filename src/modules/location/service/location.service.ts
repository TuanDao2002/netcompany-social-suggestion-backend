import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LocationRepository } from '../repository/location.repository';
import {
  CreateLocationDto,
  Period,
  PricePerPerson,
} from '../dto/create-location.dto';
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

    const { name, address, weekday, weekend, pricePerPerson } = locationData;
    if (!this.validatePeriod(weekday)) {
      throw new BadRequestException(
        'The opening time must be before the closing time on weekday',
      );
    }

    if (!this.validatePeriod(weekend)) {
      throw new BadRequestException(
        'The opening time must be before the closing time on weekend',
      );
    }

    if (pricePerPerson && !this.validatePriceRange(pricePerPerson)) {
      throw new BadRequestException(
        'The min price must be smaller than max price',
      );
    }

    const isDuplicate = await this.locationRepository.isDuplicate(
      name,
      this.formatAddress(address),
    );
    if (isDuplicate) {
      throw new BadRequestException('This location is already registered');
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

  private validatePeriod(period: Period) {
    return period.openTime < period.closeTime;
  }

  private validatePriceRange(priceRange: PricePerPerson) {
    return priceRange.min < priceRange.max;
  }

  private formatAddress(address: string) {
    let arr = address.split(','); // split the address into parts

    // remove zip code
    arr[arr.length - 2] = arr[arr.length - 2]
      .split(' ')
      .slice(0, arr.length - 2)
      .join(' ');

    return arr.join(','); // join the parts back together
  }
}
