import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Location } from 'src/modules/location/schema/locations.schema';
import { User } from '../../user/schema/users.schema';
import { Itinerary } from './itinerary.schema';

export type ItineraryLocationDocument = HydratedDocument<ItineraryLocation>;

@Schema({ timestamps: true })
export class ItineraryLocation {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Itinerary.name,
    required: true,
  })
  itineraryId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Location.name,
    required: true,
  })
  locationId: Types.ObjectId;

  @Prop({
    required: true
  })
  index: number;
}

export const ItineraryLocationSchema = SchemaFactory.createForClass(ItineraryLocation);
ItineraryLocationSchema.index({ userId: 1 });
