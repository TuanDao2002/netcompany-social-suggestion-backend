import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schema/users.schema';
import { Location } from "../../location/schema/locations.schema";

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Location.name,
    required: false,
  })
  locationId: Types.ObjectId;

  @Prop({
    type: Date,
    required: true,
  })
  startDateTime: Date;

  @Prop({
    type: {
      hours: {
        type: Number,
        required: true,
      },
      minutes: {
        type: Number,
        required: true,
      },
    },
    required: false,
  })
  duration: {
    hours: number;
    minutes: number;
  };

  @Prop({ required: true, trim: true })
  imageUrls: [string];

  @Prop({
    required: false,
    trim: true,
  })
  description: string;

  @Prop({
    required: true,
    default: false,
  })
  allDay: boolean;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: User.name,
    required: true,
  })
  guests: [Types.ObjectId];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: Types.ObjectId;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ guests: 1 });
EventSchema.index({ userId: 1 });
EventSchema.index({ createdAt: 1 });

