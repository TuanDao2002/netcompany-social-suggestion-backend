import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schema/users.schema';

export type NotificationSeenDocument = HydratedDocument<NotificationSeen>;

@Schema({ timestamps: true })
export class NotificationSeen {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Date,
    required: true,
  })
  latestSeenDateTime: Date;
}

export const NotificationSeenSchema =
  SchemaFactory.createForClass(NotificationSeen);
NotificationSeenSchema.index({ userId: 1 });
NotificationSeenSchema.index({ latestSeenDateTime: 1 });
