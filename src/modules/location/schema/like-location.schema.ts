import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/schema/users.schema';
import { Location } from './locations.schema';

export type LikeLocationDocument = HydratedDocument<LikeLocation>;

@Schema({ timestamps: true })
export class LikeLocation {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Location.name,
    required: true,
  })
  locationId: string;
}

export const LikeLocationSchema = SchemaFactory.createForClass(LikeLocation);
LikeLocationSchema.index({ userId: 1 });
LikeLocationSchema.index({ locationId: 1 });
