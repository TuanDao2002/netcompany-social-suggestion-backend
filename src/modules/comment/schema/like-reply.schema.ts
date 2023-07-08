import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/schema/users.schema';
import { Reply } from './reply.schema';

export type LikeReplyDocument = HydratedDocument<LikeReply>;

@Schema({ timestamps: true })
export class LikeReply {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Reply.name,
    required: true,
  })
  replyId: string;
}

export const LikeReplySchema = SchemaFactory.createForClass(LikeReply);
LikeReplySchema.index({ userId: 1 });
LikeReplySchema.index({ replyId: 1 });
