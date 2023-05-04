import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from '../schema/locations.schema';
import { CreateLocationDto } from '../dto/create-location.dto';

@Injectable()
export class LocationRepository {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
  ) {}

  public async createLocation(
    createLocationDto: CreateLocationDto,
  ): Promise<LocationDocument> {
    const createdLocation = new this.locationModel(createLocationDto);
    return createdLocation.save();
  }
}
