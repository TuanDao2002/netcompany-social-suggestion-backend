import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventRepository } from '../repository/event.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { UserDocument } from '../../user/schema/users.schema';
import { DateTime } from 'luxon';
import { EventFilterType } from '../../../common/event-filter-type.enum';
import mongoose from 'mongoose';
import { EventDocument } from '../schema/event.schema';
import { UpdateEventDto } from '../dto/update-event.dto';
import { Response } from 'express';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  public async createEvent(eventData: CreateEventDto, user: UserDocument) {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const { startDate, startTime, duration, allDay } = eventData;
    let luxonDate = DateTime.fromISO(startDate.toString(), { setZone: true });
    if (allDay) {
      luxonDate = luxonDate.set({ hour: 0, minute: 0 });
      eventData.duration = null;
    } else if (startTime && duration) {
      const { hours, minutes } = startTime;
      luxonDate = luxonDate.set({ hour: hours, minute: minutes });
    } else {
      throw new BadRequestException(
        'Please enter start time and duration of the event',
      );
    }

    if (luxonDate.toUTC() <= DateTime.local().toUTC()) {
      throw new BadRequestException(
        'Please enter a start date and time in the future',
      );
    }

    eventData.guests = Array.from(new Set(eventData.guests)) as [string];

    delete eventData.startDate;
    delete eventData.startTime;

    return await this.eventRepository.createEvent(
      { ...eventData, startDateTime: luxonDate.toUTC().toBSON() },
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

    let luxonDate = DateTime.fromISO(startDate.toString(), { setZone: true });
    if (allDay) {
      luxonDate = luxonDate.set({ hour: 0, minute: 0 });
      updateEventData.duration = null;
    } else if (startTime && duration) {
      const { hours, minutes } = startTime;
      luxonDate = luxonDate.set({ hour: hours, minute: minutes });
    } else {
      throw new BadRequestException(
        'Please enter start time and duration of the event',
      );
    }

    if (luxonDate.toUTC() <= DateTime.local().toUTC()) {
      throw new BadRequestException(
        'Please enter a start date and time in the future',
      );
    }

    updateEventData.guests = Array.from(new Set(updateEventData.guests)) as [
      string,
    ];

    delete updateEventData.startDate;
    delete updateEventData.startTime;

    return await this.eventRepository.updateEvent({
      ...updateEventData,
      startDateTime: luxonDate.toUTC().toBSON(),
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
    res.json({ msg: 'The location is deleted' });
  }

  public isOwner(user: UserDocument, existingEvent: EventDocument): boolean {
    return String(user._id) === String(existingEvent.userId);
  }
}
