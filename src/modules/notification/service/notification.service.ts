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
import { NotificationDocument } from '../schema/notification.schema';

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
        content: `'${modifier.username}' has updated event: '${name}'`,
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
      });
    });

    await this.notificationRepository.createMultipleNotification(
      newNotifications,
    );

    this.pusherService.sendNotifications(newNotifications, modifier);
  }
}
