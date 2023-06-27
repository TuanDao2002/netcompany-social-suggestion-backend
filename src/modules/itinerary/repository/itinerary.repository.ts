import { InjectModel } from '@nestjs/mongoose';
import { Itinerary, ItineraryDocument } from '../schema/itinerary.schema';
import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { CreateItineraryDto } from '../dto/create-itinerary.dto';
import { UserDocument } from '../../user/schema/users.schema';
import { CommonConstant } from '../../../common/constant';
import { UpdateItineraryDto } from '../dto/update-itinerary.dto';

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
    updateItineraryData: UpdateItineraryDto,
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
}
