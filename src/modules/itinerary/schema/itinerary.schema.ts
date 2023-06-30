import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schema/users.schema';
import { ItineraryLocation } from './itinerary-location.schema';
import { CommonConstant } from '../../../common/constant';

export type ItineraryDocument = HydratedDocument<Itinerary>;

@Schema({ timestamps: true })
export class Itinerary {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: ItineraryLocation.name,
    required: true,
    default: [],
    maxlength: CommonConstant.ITINERARY_LOCATIONS_SIZE_LIMIT,
  })
  savedLocations: [Types.ObjectId];
}

export const ItinerarySchema = SchemaFactory.createForClass(Itinerary);
ItinerarySchema.index({ userId: 1 });
ItinerarySchema.index({ savedLocations: 1 });
