import { InjectModel } from '@nestjs/mongoose';
import { Itinerary, ItineraryDocument } from '../schema/itinerary.schema';
import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { CreateItineraryDto } from '../dto/create-itinerary.dto';
import { UserDocument } from '../../user/schema/users.schema';
import { CommonConstant } from '../../../common/constant';

@Injectable()
export class ItineraryRepository {
  constructor(
    @InjectModel(Itinerary.name)
    private itineraryModel: Model<ItineraryDocument>,
  ) {}

  public async createItinerary(
    createItineraryDto: CreateItineraryDto,
    user: UserDocument,
  ): Promise<ItineraryDocument> {
    return await this.itineraryModel.create({
      ...createItineraryDto,
      userId: user._id,
    });
  }

  public async getItineraryList(
    next_cursor: string,
    queryObject: any,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    let sortingQuery = { createdAt: -1, _id: -1 };
    if (next_cursor) {
      const decodedFromNextCursor = Buffer.from(next_cursor, 'base64')
        .toString('ascii')
        .split('_');

      const [createdAt, _id] = decodedFromNextCursor;
      queryObject.createdAt = { $lte: new Date(createdAt) };
      queryObject._id = { $lt: new mongoose.Types.ObjectId(_id) };
    }

    let filterPipelineStage: any[] = [
      {
        $sort: sortingQuery,
      },
      {
        $match: queryObject,
      },
      {
        $limit: CommonConstant.ITINERARY_PAGINATION_LIMIT,
      },
      {
        $project: {
          userId: 0,
          savedLocations: 0,
        },
      },
    ];

    let countPipelineStage: any[] = [
      {
        $match: queryObject,
      },
      {
        $group: {
          _id: null,
          numOfResults: { $sum: 1 },
        },
      },
    ];

    let results: any[] = await this.itineraryModel.aggregate(
      filterPipelineStage,
    );

    const totalMatchResults = await this.itineraryModel.aggregate(
      countPipelineStage,
    );
    const count = totalMatchResults[0]?.numOfResults || 0;

    next_cursor = null;
    if (count > results.length) {
      const lastResult = results[results.length - 1];
      next_cursor = Buffer.from(
        lastResult.createdAt.toISOString() + '_' + lastResult._id,
      ).toString('base64');
    }

    return {
      results,
      next_cursor,
    };
  }

  public async findItineraryById(
    itineraryId: string,
  ): Promise<ItineraryDocument> {
    return await this.itineraryModel.findById(itineraryId);
  }

  public async updateItinerary(
    updateItineraryData: any,
  ): Promise<ItineraryDocument> {
    return await this.itineraryModel.findOneAndUpdate(
      {
        _id: updateItineraryData.itineraryId,
      },
      {
        ...updateItineraryData,
      },
      { new: true },
    );
  }

  public async addLocationToItinerary(
    itineraryId: string,
    itineraryLocationId: string,
  ): Promise<mongoose.mongo.UpdateResult> {
    return await this.itineraryModel.updateOne(
      { _id: itineraryId },
      { $push: { savedLocations: itineraryLocationId } },
    );
  }

  public async removeLocationFromItinerary(
    itineraryId: string,
    itineraryLocationId: string,
  ) {
    return await this.itineraryModel.updateOne(
      { _id: itineraryId },
      { $pull: { savedLocations: itineraryLocationId } },
    );
  }

  public async deleteItinerary(itineraryId: string): Promise<void> {
    await this.itineraryModel.deleteOne({ _id: itineraryId });
  }

  public async getSavedLocationsInItinerary(
    itineraryId: string,
  ): Promise<any[]> {
    let filterPipelineStage: any[] = [
      {
        $match: { _id: new mongoose.Types.ObjectId(itineraryId) },
      },
      {
        $limit: 1,
      },
      {
        $unwind: '$savedLocations',
      },
      {
        $lookup: {
          from: 'itinerarylocations',
          localField: 'savedLocations',
          foreignField: '_id',
          as: 'savedLocations',
        },
      },
      { $unwind: '$savedLocations' },
      {
        $lookup: {
          from: 'locations',
          localField: 'savedLocations.locationId',
          foreignField: '_id',
          as: 'savedLocations.location',
        },
      },
      { $unwind: '$savedLocations.location' },
      {
        $group: {
          // do this to populate locationId inside each itineraryLocationId
          _id: '$_id',
          userId: { $first: '$userId' },
          name: { $first: '$name' },
          savedLocations: { $push: '$savedLocations' },
        },
      },
      {
        $project: {
          savedLocations: {
            itineraryId: 0,
            locationId: 0,
            location: {
              placeId: 0,
              nameAddress: 0,
              location: 0,
              description: 0,
              imageUrls: 0,
              locationCategory: 0,
              pricePerPerson: 0,
              weekday: 0,
              weekend: 0,
              heartCount: 0,
              userId: 0,
            },
          },
        },
      },
    ];

    return await this.itineraryModel.aggregate(filterPipelineStage);
  }
}
