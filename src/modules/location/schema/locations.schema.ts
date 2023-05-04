import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LocationCategory } from '../../../common/location-category.enum';
import { Currency } from '../../../common/currency.enum';

export type LocationDocument = HydratedDocument<Location>;

@Schema({ timestamps: true })
export class Location {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
  })
  address: string;

  @Prop({
    type: {
      latitude: {
        type: Number,
        default: 0,
      },
      longitude: {
        type: Number,
        default: 0,
      },
    },
    required: true,
  })
  coordinates: {
    latitude: number;
    longitude: number;
  };

  @Prop({
    required: true,
    trim: true,
  })
  description: string;

  @Prop({
    type: String,
    enum: LocationCategory,
    required: true,
  })
  locationCategories: [LocationCategory];

  @Prop({
    type: {
      value: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        enum: Currency,
        default: Currency.VND,
      },
    },
    required: true,
  })
  averagePrice: {
    value: number;
    currency: string;
  };

  @Prop({ required: true, trim: true })
  imageUrl: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
