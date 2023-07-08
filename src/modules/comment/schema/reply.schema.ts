import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/schema/users.schema';
import { Comment } from "./comment.schema";

export type ReplyDocument = HydratedDocument<Reply>;

@Schema({ timestamps: true })
export class Reply {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Comment.name,
    required: true,
  })
  targetCommentId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  targetUserId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
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
  heartCount: number;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);
ReplySchema.index({ targetCommentId: 1 });
