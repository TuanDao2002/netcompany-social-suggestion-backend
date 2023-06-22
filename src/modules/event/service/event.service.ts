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

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  public async createEvent(
    eventData: CreateEventDto,
    user: UserDocument,
  ): Promise<EventDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const { startDate, startTime, duration, allDay } = eventData;
    let luxonStartDateTime = DateTime.fromISO(startDate.toString(), {
      setZone: true,
    });
    if (allDay) {
      luxonStartDateTime = luxonStartDateTime.set({ hour: 0, minute: 0 });
      eventData.duration = null;
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
    const luxonDuration = Duration.fromObject(duration)
      .shiftTo('years', 'months', 'days', 'hours', 'minutes')
      .toObject();
    const luxonExpiredDateTime = luxonStartDateTime.plus(luxonDuration);

    eventData.guests = Array.from(new Set(eventData.guests)) as [string];

    delete eventData.startDate;
    delete eventData.startTime;

    return await this.eventRepository.createEvent(
      {
        ...eventData,
        startDateTime: luxonStartDateTime.toUTC().toBSON(),
        expiredAt: luxonExpiredDateTime.toUTC().toBSON(),
      },
      user,
    );
  }

  public async filterEvent(
    filterType: EventFilterType,
    next_cursor: string,
    user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    let queryObject: any = {};
    if (filterType === EventFilterType.CREATED) {
      queryObject.userId = new mongoose.Types.ObjectId(user._id);
    }

    if (filterType === EventFilterType.INVITED) {
      queryObject.guests = new mongoose.Types.ObjectId(user._id);
    }

    if (filterType === EventFilterType.PAST) {
      queryObject.expiredAt = { $lte: new Date() };
    } else {
      queryObject.expiredAt = { $gt: new Date() };
    }

    return await this.eventRepository.filterEvent(queryObject, next_cursor);
  }

  public async searchEventByInput(
    input: string,
    next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    let queryObject: any = {};
    const formattedSearchInput = Utils.removeSpace(
      String(input).replace(/[^\p{L}\d\s]/giu, ''),
    );
    if (formattedSearchInput) {
      const regexPattern = `.*${formattedSearchInput.split(' ').join('.*')}.*`;
      queryObject.name = { $regex: `${regexPattern}`, $options: 'i' };
    }
    return await this.eventRepository.filterEvent(queryObject, next_cursor);
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
  ): Promise<EventDocument> {
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
      updateEventData.duration = null;
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
    const luxonDuration = Duration.fromObject(duration)
      .shiftTo('years', 'months', 'days', 'hours', 'minutes')
      .toObject();
    const luxonExpiredDateTime = luxonStartDateTime.plus(luxonDuration);

    delete updateEventData.startDate;
    delete updateEventData.startTime;

    return await this.eventRepository.updateEvent({
      ...updateEventData,
      startDateTime: luxonStartDateTime.toUTC().toBSON(),
      expiredAt: luxonExpiredDateTime.toUTC().toBSON(),
    });
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
  }

  public isOwner(user: UserDocument, existingEvent: EventDocument): boolean {
    return String(user._id) === String(existingEvent.userId);
  }
}
