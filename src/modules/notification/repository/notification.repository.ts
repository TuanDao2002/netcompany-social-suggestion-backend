import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Notification,
  NotificationDocument,
} from '../schema/notification.schema';
import mongoose, { Model } from 'mongoose';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { CommonConstant } from '../../../common/constant';
import { Event, EventDocument } from '../../event/schema/event.schema';
import { EventService } from '../../event/service/event.service';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
    private eventService: EventService,
  ) {}

  public async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    return await this.notificationModel.create(createNotificationDto);
  }

  public async updateNotification(
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationDocument> {
    return await this.notificationModel.findOneAndUpdate(
      {
        _id: updateNotificationDto.notificationId,
      },
      {
        ...updateNotificationDto,
      },
      { new: true },
    );
  }

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
      queryObject.createdAt = { $gte: new Date(createdAt) };
      queryObject._id = { $gt: new mongoose.Types.ObjectId(_id) };
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

  public async getUserIdsRelevantToEvent(
    locationId: string,
  ): Promise<string[]> {
    let queryObject: any = {};
    queryObject.$and = [
      { locationId: new mongoose.Types.ObjectId(locationId) },
      this.eventService.filterAvailableEvents(),
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
}
