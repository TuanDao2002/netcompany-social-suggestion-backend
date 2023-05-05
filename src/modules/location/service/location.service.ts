import { BadRequestException, Injectable } from '@nestjs/common';
import { LocationRepository } from '../repository/location.repository';
import { CreateLocationDto, Period } from '../dto/create-location.dto';
import { LocationDocument } from '../schema/locations.schema';

@Injectable()
export class LocationService {
  constructor(private readonly locationRepository: LocationRepository) {}

  public async createLocation(
    locationData: CreateLocationDto,
  ): Promise<LocationDocument> {
    const { periods } = locationData;
    if (!this.validatePeriods(periods)) {
      throw new BadRequestException('Open time must be before close time');
    }

    return await this.locationRepository.createLocation(locationData);
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
