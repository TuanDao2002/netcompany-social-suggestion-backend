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
    return await this.notificationModel.insertMany(createNotificationDtos, {
      ordered: false,
    });
  }

  public async getNotifications(
    queryObject: any,
    next_cursor: string,
    userId: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    const lastNotificationSeen = await this.notificationSeenModel.findOne({
      userId,
    });
    const latestSeenDateTime = lastNotificationSeen
      ? new Date(lastNotificationSeen.latestSeenDateTime)
      : new Date(0);

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
        $addFields: {
          isSeen: {
            $cond: [{ $lte: ['$createdAt', latestSeenDateTime] }, true, false],
          },
        },
      },
      {
        $project: {
          targetUserId: 0,
          modifier: {
            isVerified: 0,
            locationCategories: 0,
            searchDistance: 0,
            email: 0,
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

  public async getAffectedEvents(locationId: string): Promise<any[]> {
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
            $concatArrays: ['$guests', ['$userId']],
          },
        },
      },
      {
        $project: {
          locationId: 0,
          startDateTime: 0,
          expiredAt: 0,
          duration: 0,
          imageUrls: 0,
          description: 0,
          allDay: 0,
          guests: 0,
          userId: 0,
        },
      },
    ];

    const totalMatchResults = await this.eventModel.aggregate(
      filterPipelineStage,
    );
    return totalMatchResults;
  }

  public async getAffectedItineraryLocations(
    locationId: string,
  ): Promise<any[]> {
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
        $unwind: {
          path: '$itineraryDetail',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          locationId: 0,
          note: 0,
        },
      },
    ];

    const totalMatchResults: any[] =
      await this.itineraryLocationModel.aggregate(filterPipelineStage);

    return totalMatchResults;
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
