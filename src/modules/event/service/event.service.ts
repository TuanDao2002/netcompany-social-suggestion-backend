import { BadRequestException, Injectable } from '@nestjs/common';
import { EventRepository } from '../repository/event.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { UserDocument } from '../../user/schema/users.schema';
import { DateTime } from 'luxon';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  public async createEvent(eventData: CreateEventDto, user: UserDocument) {
    const { startDate, startTime, allDay } = eventData;
    let luxonDate = DateTime.fromISO(startDate.toString(), { setZone: true });
    if (allDay) {
      luxonDate = luxonDate.set({ hour: 0, minute: 0 });
    } else if (startTime) {
      const { hours, minutes } = startTime;
      luxonDate = luxonDate.set({ hour: hours, minute: minutes });
    } else {
      throw new BadRequestException('Please enter start time of the event');
    }

    eventData.guests = Array.from(new Set(eventData.guests)) as [string];

    delete eventData.startDate;
    delete eventData.startTime;

    return await this.eventRepository.createEvent(
      { ...eventData, startDateTime: luxonDate.toUTC().toBSON() },
      user,
    );
  }
}
