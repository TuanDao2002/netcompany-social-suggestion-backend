import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LocationCategory } from '../../../common/location-category.enum';
import { Currency } from '../../../common/currency.enum';
import { WeekDay } from '../../../common/weekday.enum';
import { CommonConstant } from '../../../common/constant';

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
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: {
    type: string;
    coordinates: [number];
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
  locationCategory: LocationCategory;

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
    currency: Currency;
  };

  @Prop({
    type: [
      {
        day: {
          type: Number,
          enum: WeekDay,
        },
        openTime: {
          type: String,
          match: CommonConstant.TimeRegex,
        },
        closeTime: {
          type: String,
          match: CommonConstant.TimeRegex,
        },
      },
    ],
  })
  periods: {
    day: WeekDay;
    openTime: string;
    closeTime: string;
  };

  @Prop({ required: true, trim: true })
  imageUrl: string;

  @Prop({ required: true, default: 0 })
  heartCount: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
LocationSchema.index({ name: 1 });
LocationSchema.index({ address: 1 });
LocationSchema.index({ locationCategory: 1 });
LocationSchema.index({ periods: 1 });
LocationSchema.index({ heartCount: 1 });
LocationSchema.index({ createdAt: 1 });
LocationSchema.index({ location: '2dsphere' });
