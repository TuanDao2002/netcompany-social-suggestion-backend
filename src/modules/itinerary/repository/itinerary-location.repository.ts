import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserDocument } from "src/modules/user/schema/users.schema";
import { ItineraryLocation, ItineraryLocationDocument } from "../schema/location-itinerary.schema";

@Injectable()
export class ItineraryLocationRepository {
  constructor(
    @InjectModel(ItineraryLocation.name)
    private itineraryLocationModel: Model<ItineraryLocationDocument>,
  ) {}

  public async createItineraryLocation(
    createItineraryLocationDto: any,
    user: UserDocument,
  ): Promise<ItineraryLocationDocument> {
    return await this.itineraryLocationModel.create({
      ...createItineraryLocationDto,
      userId: user._id,
    });
  }

  public async updateItineraryLocation(
    updateItineraryLocationData: any,
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

  public async deleteItineraryLocation(itineraryLocationId: string): Promise<void> {
    await this.itineraryLocationModel.deleteOne({ _id: itineraryLocationId });
  }
}