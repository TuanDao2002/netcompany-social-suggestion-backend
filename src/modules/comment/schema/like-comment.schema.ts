import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/schema/users.schema';
import { Comment } from './comment.schema';

export type LikeCommentDocument = HydratedDocument<LikeComment>;

@Schema({ timestamps: true })
export class LikeComment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Comment.name,
    required: true,
  })
  commentId: string;
}

export const LikeCommentSchema = SchemaFactory.createForClass(LikeComment);
LikeCommentSchema.index({ userId: 1 });
LikeCommentSchema.index({ commentId: 1 });
