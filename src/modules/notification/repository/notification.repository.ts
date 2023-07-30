import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Notification,
  NotificationDocument,
} from '../schema/notification.schema';
import mongoose, { Model } from 'mongoose';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { CommonConstant } from '../../../common/constant';
import { Event, EventDocument } from '../../event/schema/event.schema';
import {
  ItineraryLocation,
  ItineraryLocationDocument,
} from '../../itinerary/schema/itinerary-location.schema';
import {
  NotificationSeen,
  NotificationSeenDocument,
} from '../schema/notification-seen.schema';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationSeen.name)
    private notificationSeenModel: Model<NotificationSeenDocument>,
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
    @InjectModel(ItineraryLocation.name)
    private itineraryLocationModel: Model<ItineraryLocationDocument>,
  ) {}

  public async createMultipleNotification(
    createNotificationDtos: CreateNotificationDto[],
  ): Promise<NotificationDocument[]> {
    return await this.notificationModel.insertMany(createNotificationDtos);
  }

  // public async findNotificationById(
  //   notificationId: string,
  // ): Promise<NotificationDocument> {
  //   return await this.notificationModel.findById(notificationId);
  // }

  // public async updateNotification(
  //   updateNotificationDto: UpdateNotificationDto,
  // ): Promise<NotificationDocument> {
  //   return await this.notificationModel.findOneAndUpdate(
  //     {
  //       _id: updateNotificationDto.notificationId,
  //     },
  //     {
  //       ...updateNotificationDto,
  //     },
  //     { new: true },
  //   );
  // }

  public async getNotifications(
    queryObject: any,
    next_cursor: string,
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
        $lookup: {
          from: 'users',
          localField: 'modifierId',
          foreignField: '_id',
          as: 'modifier',
        },
      },
      {
        $unwind: {
          path: '$modifier',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $limit: CommonConstant.NOTIFICATION_PAGINATION_LIMIT,
      },
      {
        $project: {
          targetUserId: 0,
          modifier: {
            isVerified: 0,
            locationCategories: 0,
            searchDistance: 0,
            email: 0,
            imageUrl: 0,
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

    let results: any[] = await this.notificationModel.aggregate(
      filterPipelineStage,
    );

    const totalMatchResults = await this.notificationModel.aggregate(
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

  public async getUserIdsOfAffectedEvents(
    locationId: string,
  ): Promise<string[]> {
    let queryObject: any = {};
    queryObject.$and = [
      { locationId: new mongoose.Types.ObjectId(locationId) },
      { $expr: { $gt: ['$expiredAt', new Date()] } },
    ];

    let filterPipelineStage: any[] = [
      {
        $match: queryObject,
      },
      {
        $addFields: {
          relevantUserIds: {
            $concatArrays: ['$guests', [{ $toString: '$userId' }]],
          },
        },
      },
      {
        $unwind: '$relevantUserIds',
      },
      {
        $group: {
          _id: null, // Grouping by null will group all documents together.
          combinedArray: {
            $push: '$relevantUserIds', // Push each item to the new array.
          },
        },
      },
    ];

    const totalMatchResults = await this.eventModel.aggregate(
      filterPipelineStage,
    );
    return totalMatchResults[0]?.combinedArray || [];
  }

  public async getUserIdsOfAffectedItineraries(
    locationId: string,
  ): Promise<string[]> {
    let queryObject: any = {};
    queryObject.$and = [
      { locationId: new mongoose.Types.ObjectId(locationId) },
    ];

    let filterPipelineStage: any[] = [
      {
        $match: queryObject,
      },
      {
        $lookup: {
          from: 'itineraries',
          localField: 'itineraryId',
          foreignField: '_id',
          as: 'itineraryDetail',
        },
      },
      {
        $unwind: '$itineraryDetail',
      },
      {
        $group: {
          _id: null, // Grouping by null will group all documents together.
          userIdList: {
            $push: '$itineraryDetail.userId', // Push each item to the new array.
          },
        },
      },
    ];

    const results: any[] = await this.itineraryLocationModel.aggregate(
      filterPipelineStage,
    );

    return results[0]?.userIdList || [];
  }

  public async countUnseenNotifications(targetUserId: string): Promise<number> {
    const notificationSeen = await this.notificationSeenModel.findOne({
      userId: targetUserId,
    });

    let queryObject: any = { targetUserId };
    if (notificationSeen) {
      queryObject.createdAt = {
        $gt: new Date(notificationSeen.latestSeenDateTime),
      };
    }

    return await this.notificationModel.countDocuments(queryObject);
  }

  public async updateLatestDateTimeSeenNotification(
    userId: string,
  ): Promise<void> {
    const lastSeenNotification: any = await this.notificationModel
      .findOne({ targetUserId: userId })
      .sort({ createdAt: -1, _id: -1 });

    await this.notificationSeenModel.updateOne(
      { userId },
      { latestSeenDateTime: lastSeenNotification.createdAt, userId },
      { upsert: true },
    );
  }
}
