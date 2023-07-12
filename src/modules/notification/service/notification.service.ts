import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationRepository } from '../repository/notification.repository';
import { UserDocument } from '../../user/schema/users.schema';
import mongoose from 'mongoose';
import { PusherService } from './pusher.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { ModelType } from '../../../common/model-type.enum';
import { LocationDocument } from '../../location/schema/locations.schema';
import { EventRepository } from '../../event/repository/event.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly eventRepository: EventRepository,
    private readonly pusherService: PusherService,
  ) {}

  public async getNotifications(
    user: UserDocument,
    next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const queryObject = { targetUserId: new mongoose.Types.ObjectId(user._id) };
    return await this.notificationRepository.getNotifications(
      queryObject,
      next_cursor,
    );
  }

  public async notifyAboutLocationChanges(
    location: LocationDocument,
    modifier: UserDocument,
  ): Promise<void> {
    const [userIdsOfAffectedEvents, userIdsOfAffectedItineraries] =
      await Promise.all([
        this.notificationRepository.getUserIdsOfAffectedEvents(
          String(location._id),
        ),
        this.notificationRepository.getUserIdsOfAffectedItineraries(
          String(location._id),
        ),
      ]);

    let userIds = Array.from(
      new Set([
        ...userIdsOfAffectedEvents.map((id: any) => id.toString()),
        ...userIdsOfAffectedItineraries.map((id: any) => id.toString()),
      ]),
    ) as [string];
    userIds = userIds.filter((userId) => userId !== String(modifier._id)) as [
      string,
    ];

    const newNotifications: CreateNotificationDto[] = [];
    userIds.forEach((userId) => {
      newNotifications.push({
        content: `"${modifier.username}" has updated location: "${location.name}"`,
        targetUserId: userId,
        modifierId: String(modifier._id),
        redirectTo: {
          targetId: String(location._id),
          modelType: ModelType.LOCATION,
        },
      });
    });

    await this.notificationRepository.createMultipleNotification(
      newNotifications,
    );

    this.pusherService.sendNotification(userIds, {
      content: `"${modifier.username}" has updated location: "${location.name}"`,
      modifierId: String(modifier._id),
      modifierImageUrl: modifier.imageUrl,
      redirectTo: {
        targetId: String(location._id),
        modelType: ModelType.LOCATION,
      },
    });
  }

  public async notifyAboutEventChanges(
    eventId: string,
    modifier: UserDocument,
  ): Promise<void> {
    const findEvent = await this.eventRepository.viewDetailEvent(eventId);
    if (findEvent.length === 0) {
      throw new NotFoundException('This event does not exist');
    }

    const { guests, name } = findEvent[0];
    let userIds = guests.map((guest: any) => guest._id.toString()) as [string];
    userIds = userIds.filter((userId) => userId !== String(modifier._id)) as [
      string,
    ];

    const newNotifications: CreateNotificationDto[] = [];
    userIds.forEach((userId) => {
      newNotifications.push({
        content: `"${modifier.username}" has updated event: "${name}"`,
        targetUserId: userId,
        modifierId: String(modifier._id),
        redirectTo: {
          targetId: String(eventId),
          modelType: ModelType.EVENT,
        },
      });
    });

    await this.notificationRepository.createMultipleNotification(
      newNotifications,
    );

    this.pusherService.sendNotification(userIds, {
      content: `"${modifier.username}" has updated event: "${name}"`,
      modifierId: String(modifier._id),
      modifierImageUrl: modifier.imageUrl,
      redirectTo: {
        targetId: String(eventId),
        modelType: ModelType.EVENT,
      },
    });
  }
}
