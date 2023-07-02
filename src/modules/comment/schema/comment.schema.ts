import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Location } from '../../location/schema/locations.schema';
import { User } from '../../user/schema/users.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: Location.name,
    required: true,
  })
  locationId: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: User.name,
    required: true,
  })
  userId: string;

  @Prop({
    required: true,
    trim: true,
  })
  content: string;

  @Prop({
    required: true,
    default: 0,
  })
  numOfReplies: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.index({ locationId: 1 });
