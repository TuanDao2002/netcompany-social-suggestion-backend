import { Injectable } from '@nestjs/common';
import { LocationRepository } from '../repository/location.repository';
import { CreateLocationDto } from '../dto/create-location.dto';
import { LocationDocument } from '../schema/locations.schema';

@Injectable()
export class LocationService {
  constructor(private readonly locationRepository: LocationRepository) {}

  public async createLocation(
    locationData: CreateLocationDto,
  ): Promise<LocationDocument> {
    return await this.locationRepository.createLocation(locationData);
  }
}
