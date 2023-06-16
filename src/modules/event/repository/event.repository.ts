import { Model } from 'mongoose';
import { Event, EventDocument } from '../schema/event.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UserDocument } from '../../user/schema/users.schema';

@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  public async createEvent(
    eventData: any,
    user: UserDocument,
  ): Promise<EventDocument> {
    return await this.eventModel.create({ ...eventData, userId: user._id });
  }
}
