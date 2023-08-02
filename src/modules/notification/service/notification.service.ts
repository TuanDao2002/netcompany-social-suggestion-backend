import {
  Injectable,
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
import { NotificationType } from '../../../common/notification-type.enum';
import { EventDocument } from "../../event/schema/event.schema";

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
    const response = await this.notificationRepository.getNotifications(
      queryObject,
      next_cursor,
      String(user._id),
    );

    if (response.results.length > 0) {
      await this.notificationRepository.updateLatestDateTimeSeenNotification(
        String(user._id),
      );
    }

    return response;
  }

  public async notifyAboutLocationChanges(
    location: LocationDocument,
    modifier: UserDocument,
  ): Promise<void> {
    await Promise.all([
      this.notifyToUsersOfAffectedEvents(location, modifier),
      this.notifyToUsersOfAffectedItineraries(location, modifier),
    ]);
  }

  public async notifyAboutEventChanges(
    eventId: string,
    modifier: UserDocument,
    notificationType: NotificationType,
    deletedEvent: EventDocument = null
  ): Promise<void> {
    let guests: any[] = [];
    let name = "";
    const findEvent = await this.eventRepository.viewDetailEvent(eventId);
    if (findEvent.length === 0 && deletedEvent) {
      guests = deletedEvent.guests;
      name = deletedEvent.name;
    } else {
      guests = findEvent[0].guests;
      name = findEvent[0].name;
    }

    let userIds = guests.map((guest: any) => guest._id.toString()) as [string];
    userIds = userIds.filter((userId) => userId !== String(modifier._id)) as [
      string,
    ];

    let content: string = '';
    if (notificationType === NotificationType.EVENT_INVITATION) {
      content = `'${modifier.username}' has invited you to event: '${name}'`
    } else if (notificationType === NotificationType.EVENT_DELETE) {
      content = `'${modifier.username}' has deleted event: '${name}'`
    } else if (notificationType === NotificationType.EVENT_MODIFICATION) {
      content = `'${modifier.username}' has modified event: '${name}'`
    }

    const newNotifications: CreateNotificationDto[] = [];
    userIds.forEach((userId) => {
      newNotifications.push({
        content,
        targetUserId: userId,
        modifierId: String(modifier._id),
        redirectTo: {
          targetId: String(eventId),
          modelType: ModelType.EVENT,
        },
        notificationType
      });
    });

    await this.notificationRepository.createMultipleNotification(
      newNotifications,
    );

    this.pusherService.sendNotifications(newNotifications, modifier);
  }

  public async countUnseenNotifications(user: UserDocument): Promise<number> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    return await this.notificationRepository.countUnseenNotifications(
      String(user._id),
    );
  }

  private async notifyToUsersOfAffectedEvents(
    location: LocationDocument,
    modifier: UserDocument,
  ): Promise<void> {
    const affectEvents = await this.notificationRepository.getAffectedEvents(
      String(location._id),
    );

    let newNotifications: CreateNotificationDto[] = [];
    for (let event of affectEvents) {
      let formattedUserIdsOfAffectedEvents = Array.from(
        new Set([...event.relevantUserIds.map((id: any) => id.toString())]),
      ) as [string];

      formattedUserIdsOfAffectedEvents.forEach((userId) => {
        const pronoun =
          String(userId) === String(modifier._id)
            ? 'You have'
            : `'${modifier.username}' has`;
        newNotifications.push({
          content: `${pronoun} updated the location of event: '${event.name}'`,
          targetUserId: userId,
          modifierId: String(modifier._id),
          redirectTo: {
            targetId: String(event._id),
            modelType: ModelType.EVENT,
          },
          notificationType: NotificationType.EVENT_MODIFICATION
        });
      });
    }

    await this.notificationRepository.createMultipleNotification(
      newNotifications,
    );

    this.pusherService.sendNotifications(newNotifications, modifier);
  }

  private async notifyToUsersOfAffectedItineraries(
    location: LocationDocument,
    modifier: UserDocument,
  ): Promise<void> {
    const affectItineraryLocations =
      await this.notificationRepository.getAffectedItineraryLocations(
        String(location._id),
      );
    let newNotifications: CreateNotificationDto[] = [];

    affectItineraryLocations.forEach((itineraryLocation) => {
      const userId = itineraryLocation.itineraryDetail.userId;
      const pronoun =
        String(userId) === String(modifier._id)
          ? 'You have'
          : `'${modifier.username}' has`;

      newNotifications.push({
        content: `${pronoun} updated location: '${location.name}' in itinerary: '${itineraryLocation.itineraryDetail.name}'`,
        targetUserId: userId,
        modifierId: String(modifier._id),
        redirectTo: {
          targetId: String(itineraryLocation.itineraryId),
          modelType: ModelType.ITINERARY,
        },
        notificationType: NotificationType.ITINERARY_MODIFICATION
      });
    });

    await this.notificationRepository.createMultipleNotification(
      newNotifications,
    );

    this.pusherService.sendNotifications(newNotifications, modifier);
  }
}
