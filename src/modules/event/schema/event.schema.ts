import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schema/users.schema';

export type LikeLocationDocument = HydratedDocument<Event>;

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
    required: true,
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
    required: true,
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
