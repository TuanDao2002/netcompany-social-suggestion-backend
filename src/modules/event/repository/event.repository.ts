import mongoose, { Model } from 'mongoose';
import { Event, EventDocument } from '../schema/event.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UserDocument } from '../../user/schema/users.schema';
import { CommonConstant } from '../../../common/constant';
import { EventFilterType } from '../../../common/event-filter-type.enum';

@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  public async createEvent(
    eventData: any,
    user: UserDocument,
  ): Promise<EventDocument> {
    return await this.eventModel.create({ ...eventData, userId: user._id });
  }

  public async filterEvent(
    filterType: EventFilterType,
    queryObject: any,
    next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    let sortingQuery: any = {
      startDateTime: filterType === EventFilterType.PAST ? -1 : 1,
      createdAt: -1,
      _id: -1,
    };
    if (next_cursor) {
      const decodedFromNextCursor = Buffer.from(next_cursor, 'base64')
        .toString('ascii')
        .split('_');

      const [startDateTime, createdAt, _id] = decodedFromNextCursor;
      queryObject.$or = [
        {
          startDateTime:
            filterType === EventFilterType.PAST
              ? { $lt: new Date(startDateTime) }
              : { $gt: new Date(startDateTime) },
        },
        {
          startDateTime: new Date(startDateTime),
          createdAt: { $lte: new Date(createdAt) },
          _id: { $lt: new mongoose.Types.ObjectId(_id) },
        },
      ];
    }

    let filterPipelineStage: any[] = [
      {
        $sort: sortingQuery,
      },
      {
        $match: queryObject,
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'locationId',
          foreignField: '_id',
          as: 'location',
        },
      },
      {
        $unwind: {
          path: '$location',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $limit: CommonConstant.EVENT_PAGINATION_LIMIT,
      },
      {
        $project: {
          duration: 0,
          description: 0,
          guests: 0,
          location: {
            address: 0,
            placeId: 0,
            nameAddress: 0,
            location: 0,
            description: 0,
            locationCategory: 0,
            pricePerPerson: 0,
            weekday: 0,
            weekend: 0,
            imageUrls: 0,
            heartCount: 0,
            userId: 0,
          },
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

    let results: any[] = await this.eventModel.aggregate(filterPipelineStage);

    const totalMatchResults = await this.eventModel.aggregate(
      countPipelineStage,
    );
    const count = totalMatchResults[0]?.numOfResults || 0;

    next_cursor = null;
    if (count > results.length) {
      const lastResult = results[results.length - 1];
      next_cursor = Buffer.from(
        lastResult.startDateTime.toISOString() +
          '_' +
          lastResult.createdAt.toISOString() +
          '_' +
          lastResult._id,
      ).toString('base64');
    }

    return {
      results,
      next_cursor,
    };
  }

  public async viewDetailEvent(eventId: string): Promise<any[]> {
    return await this.eventModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(eventId) },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'locationId',
          foreignField: '_id',
          as: 'location',
        },
      },
      {
        $unwind: {
          path: '$location',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'guests',
          foreignField: '_id',
          as: 'guests',
        },
      },
      {
        $project: {
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
          user: {
            isVerified: 0,
            searchDistance: 0,
            locationCategories: 0,
          },
          guests: {
            isVerified: 0,
            searchDistance: 0,
            locationCategories: 0,
          },
        },
      },
    ]);
  }

  public async findEventById(eventId: string): Promise<EventDocument> {
    return await this.eventModel.findById(eventId);
  }

  public async updateEvent(updateEventData: any): Promise<EventDocument> {
    return await this.eventModel.findOneAndUpdate(
      {
        _id: updateEventData.eventId,
      },
      {
        ...updateEventData,
      },
      { new: true },
    );
  }

  public async deleteEvent(eventId: string): Promise<void> {
    await this.eventModel.deleteOne({ _id: eventId });
  }

  public async updateEventsOrganizedAtLocation(locationId: string) {
    await this.eventModel.updateMany({ locationId }, { locationId: null });
  }
}
