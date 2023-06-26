import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ItineraryLocation,
  ItineraryLocationDocument,
} from '../schema/itinerary-location.schema';
import { CreateItineraryLocationDto } from '../dto/create-itinerary-location.dto';
import { UpdateItineraryLocationDto } from '../dto/update-itinerary-location.dto';

@Injectable()
export class ItineraryLocationRepository {
  constructor(
    @InjectModel(ItineraryLocation.name)
    private itineraryLocationModel: Model<ItineraryLocationDocument>,
  ) {}

  public async createItineraryLocation(
    createItineraryLocationDto: CreateItineraryLocationDto,
  ): Promise<ItineraryLocationDocument> {
    return await this.itineraryLocationModel.create({
      ...createItineraryLocationDto,
    });
  }

  public async findItineraryLocationById(
    itineraryLocationId: string,
  ): Promise<ItineraryLocationDocument> {
    return await this.itineraryLocationModel.findById(itineraryLocationId);
  }

  public async findDuplicateItineraryLocation(
    itineraryId: string,
    locationId: string,
  ): Promise<ItineraryLocationDocument> {
    return await this.itineraryLocationModel.findOne({
      itineraryId,
      locationId,
    });
  }

  public async updateItineraryLocation(
    updateItineraryLocationData: UpdateItineraryLocationDto,
  ): Promise<ItineraryLocationDocument> {
    return await this.itineraryLocationModel.findOneAndUpdate(
      {
        _id: updateItineraryLocationData.itineraryLocationId,
      },
      {
        ...updateItineraryLocationData,
      },
      { new: true },
    );
  }

  public async deleteItineraryLocation(
    itineraryLocationId: string,
  ): Promise<void> {
    await this.itineraryLocationModel.deleteOne({ _id: itineraryLocationId });
  }
}
