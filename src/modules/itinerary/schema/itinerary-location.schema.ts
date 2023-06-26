import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Location } from '../../location/schema/locations.schema';
import { CommonConstant } from '../../../common/constant';

export type ItineraryLocationDocument = HydratedDocument<ItineraryLocation>;

@Schema({ timestamps: true })
export class ItineraryLocation {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'itineraries',
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
    required: false,
    trim: true,
    default: '',
    maxlength: CommonConstant.ITINERARY_LOCATIONS_NOTE_LIMIT,
  })
  note: string;
}

export const ItineraryLocationSchema =
  SchemaFactory.createForClass(ItineraryLocation);
ItineraryLocationSchema.index({ itineraryId: 1 });
ItineraryLocationSchema.index({ locationId: 1 });
