import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schema/users.schema';
import { ModelType } from '../../../common/model-type.enum';

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
        type: mongoose.Schema.Types.ObjectId,
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
    targetId: Types.ObjectId;
    modelType: ModelType;
  };

  @Prop({ default: false, required: true })
  isSeen: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ targetUserId: 1 });
