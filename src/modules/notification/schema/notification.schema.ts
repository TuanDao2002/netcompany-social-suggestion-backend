import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schema/users.schema';
import { ModelType } from '../../../common/model-type.enum';
import { NotificationType } from '../../../common/notification-type.enum';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({
    required: true,
    trim: true,
  })
  content: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  targetUserId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  modifierId: Types.ObjectId;

  @Prop({
    type: {
      targetId: {
        type: String,
        required: true,
      },
      modelType: {
        type: String,
        enum: ModelType,
        required: true,
      },
    },
    required: true,
  })
  redirectTo: {
    targetId: String;
    modelType: ModelType;
  };

  @Prop({
    type: String,
    enum: NotificationType,
    required: true,
  })
  notificationType: NotificationType;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ targetUserId: 1 });
