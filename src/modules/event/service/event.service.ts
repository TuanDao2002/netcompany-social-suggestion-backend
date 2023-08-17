import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventRepository } from '../repository/event.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { UserDocument } from '../../user/schema/users.schema';
import { DateTime, Duration } from 'luxon';
import { EventFilterType } from '../../../common/event-filter-type.enum';
import mongoose from 'mongoose';
import { EventDocument } from '../schema/event.schema';
import { UpdateEventDto } from '../dto/update-event.dto';
import { Response } from 'express';
import { Utils } from '../../../common/utils';
import { NotificationService } from '../../notification/service/notification.service';
import { NotificationType } from '../../../common/notification-type.enum';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly notificationService: NotificationService,
  ) {}

  public async createEvent(
    eventData: CreateEventDto,
    user: UserDocument,
    res: Response,
  ): Promise<void> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const { startDate, startTime, duration, allDay } = eventData;
    let luxonStartDateTime = DateTime.fromISO(startDate.toString(), {
      setZone: true,
    });
    if (allDay) {
      luxonStartDateTime = luxonStartDateTime.set({ hour: 0, minute: 0 });
      eventData.duration = { hours: 24, minutes: 0 };
    } else if (startTime && duration) {
      const { hours, minutes } = startTime;
      luxonStartDateTime = luxonStartDateTime.set({
        hour: hours,
        minute: minutes,
      });
    } else {
      throw new BadRequestException(
        'Please enter start time and duration of the event',
      );
    }

    if (luxonStartDateTime.toUTC() <= DateTime.local().toUTC()) {
      throw new BadRequestException(
        'Please enter a start date and time in the future',
      );
    }

    // do this to account for DST and leap years
    const luxonDuration = Duration.fromObject(eventData.duration)
      .shiftTo('years', 'months', 'days', 'hours', 'minutes')
      .toObject();
    const luxonExpiredDateTime = luxonStartDateTime.plus(luxonDuration);

    eventData.guests = Array.from(new Set(eventData.guests)) as [string];

    delete eventData.startDate;
    delete eventData.startTime;

    const createdEvent = await this.eventRepository.createEvent(
      {
        ...eventData,
        startDateTime: luxonStartDateTime.toUTC().toBSON(),
        expiredAt: luxonExpiredDateTime.toUTC().toBSON(),
      },
      user,
    );
    res.json(createdEvent);

    await this.notificationService.notifyAboutEventChanges(
      String(createdEvent._id),
      user,
      NotificationType.EVENT_INVITATION,
    );
  }

  public async filterEvent(
    filterType: EventFilterType,
    next_cursor: string,
    searchInput: string,
    user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    let queryObject: any = {};

    if (searchInput) {
      const formattedSearchInput = Utils.removeSpace(
        String(searchInput)
      );
      if (formattedSearchInput) {
        const regexPattern = `.*${formattedSearchInput
          .split(' ')
          .join('.*')}.*`;
        queryObject.name = { $regex: `${regexPattern}`, $options: 'i' };
      }
    }

    if (filterType === EventFilterType.ALL) {
      queryObject.$and = [
        {
          $or: [
            { userId: new mongoose.Types.ObjectId(user._id) },
            { guests: new mongoose.Types.ObjectId(user._id) },
          ],
        },
        this.filterAvailableEvents(),
      ];
    }

    if (filterType === EventFilterType.CREATED) {
      queryObject.$and = [
        { userId: new mongoose.Types.ObjectId(user._id) },
        this.filterAvailableEvents(),
      ];
    }

    if (filterType === EventFilterType.INVITED) {
      queryObject.$and = [
        { guests: new mongoose.Types.ObjectId(user._id) },
        this.filterAvailableEvents(),
      ];
    }

    if (filterType === EventFilterType.PAST) {
      queryObject.$and = [
        {
          $or: [
            { userId: new mongoose.Types.ObjectId(user._id) },
            { guests: new mongoose.Types.ObjectId(user._id) },
          ],
        },
        this.filterExpiredEvents(),
      ];
    }

    return await this.eventRepository.filterEvent(filterType, queryObject, next_cursor);
  }

  public async viewDetailEvent(
    eventId: string,
    user: UserDocument,
  ): Promise<EventDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const findEvent = await this.eventRepository.viewDetailEvent(eventId);
    if (findEvent.length === 0) {
      throw new NotFoundException('This event does not exist');
    }

    return findEvent[0];
  }

  public async updateEvent(
    updateEventData: UpdateEventDto,
    user: UserDocument,
    res: Response,
  ): Promise<void> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const { eventId, startDate, startTime, duration, allDay } = updateEventData;
    const existingEvent = await this.eventRepository.findEventById(eventId);
    if (!existingEvent) {
      throw new NotFoundException('This event does not exist');
    }

    if (!this.isOwner(user, existingEvent)) {
      throw new UnauthorizedException('Not allowed to edit this event');
    }

    let luxonStartDateTime = DateTime.fromISO(startDate.toString(), {
      setZone: true,
    });
    if (allDay) {
      luxonStartDateTime = luxonStartDateTime.set({ hour: 0, minute: 0 });
      updateEventData.duration = { hours: 24, minutes: 0 };
    } else if (startTime && duration) {
      const { hours, minutes } = startTime;
      luxonStartDateTime = luxonStartDateTime.set({
        hour: hours,
        minute: minutes,
      });
    } else {
      throw new BadRequestException(
        'Please enter start time and duration of the event',
      );
    }

    if (luxonStartDateTime.toUTC() <= DateTime.local().toUTC()) {
      throw new BadRequestException(
        'Please enter a start date and time in the future',
      );
    }

    updateEventData.guests = Array.from(new Set(updateEventData.guests)) as [
      string,
    ];

    // do this to account for DST and leap years
    const luxonDuration = Duration.fromObject(updateEventData.duration)
      .shiftTo('years', 'months', 'days', 'hours', 'minutes')
      .toObject();
    const luxonExpiredDateTime = luxonStartDateTime.plus(luxonDuration);

    delete updateEventData.startDate;
    delete updateEventData.startTime;

    res.json(
      await this.eventRepository.updateEvent({
        ...updateEventData,
        startDateTime: luxonStartDateTime.toUTC().toBSON(),
        expiredAt: luxonExpiredDateTime.toUTC().toBSON(),
      }),
    );

    await this.notificationService.notifyAboutEventChanges(
      eventId,
      user,
      NotificationType.EVENT_MODIFICATION,
    );
  }

  public async deleteEvent(
    eventId: string,
    user: UserDocument,
    res: Response,
  ): Promise<void> {
    const existingEvent = await this.eventRepository.findEventById(eventId);
    if (!existingEvent) {
      throw new NotFoundException('This event does not exist');
    }
    if (!this.isOwner(user, existingEvent)) {
      throw new UnauthorizedException('Not allowed to delete this event');
    }

    await this.eventRepository.deleteEvent(eventId);
    res.json({ msg: 'The event is deleted' });

    await this.notificationService.notifyAboutEventChanges(
      eventId,
      user,
      NotificationType.EVENT_DELETE,
      existingEvent
    );
  }

  public isOwner(user: UserDocument, existingEvent: EventDocument): boolean {
    return String(user._id) === String(existingEvent.userId);
  }

  public filterAvailableEvents(): any {
    const currentDateTime = new Date();
    return { $expr: { $gt: ['$expiredAt', currentDateTime] } };
  }

  public filterExpiredEvents(): any {
    const currentDateTime = new Date();
    return { $expr: { $lte: ['$expiredAt', currentDateTime] } };
  }
}
