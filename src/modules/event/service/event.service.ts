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
      throw new BadRequestException('Please enter start time and duration of the event');
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
}
