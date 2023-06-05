import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { LocationCategory } from '../../../common/location-category.enum';
import { Currency } from '../../../common/currency.enum';
import { CommonConstant } from '../../../common/constant';
import { User } from '../../user/schema/users.schema';

export type LocationDocument = HydratedDocument<Location>;

@Schema({ timestamps: true })
export class Location {
  @Prop({
    required: true,
    trim: true,
  })
  placeId: string;

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
    required: true,
    trim: true,
  })
  nameAddress: string;

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
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        enum: Currency,
        default: Currency.VND,
      },
    },
    required: false,
  })
  pricePerPerson: {
    min: number;
    max: number;
    currency: Currency;
  };

  @Prop({
    type: {
      openTime: {
        type: String,
        match: CommonConstant.TimeRegex,
      },
      closeTime: {
        type: String,
        match: CommonConstant.TimeRegex,
      },
    },
    required: true,
  })
  weekday: {
    openTime: string;
    closeTime: string;
  };

  @Prop({
    type: {
      openTime: {
        type: String,
        match: CommonConstant.TimeRegex,
      },
      closeTime: {
        type: String,
        match: CommonConstant.TimeRegex,
      },
    },
    required: true,
  })
  weekend: {
    openTime: string;
    closeTime: string;
  };

  @Prop({ required: true, trim: true })
  imageUrls: [string];

  @Prop({ required: true, default: 0 })
  heartCount: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: Types.ObjectId;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
LocationSchema.index({ placeId: 1 });
LocationSchema.index({ name: 1 });
LocationSchema.index({ nameAddress: 1 });
LocationSchema.index({ locationCategory: 1 });
LocationSchema.index({ weekday: 1 });
LocationSchema.index({ weekend: 1 });
LocationSchema.index({ heartCount: 1 });
LocationSchema.index({ createdAt: 1 });
LocationSchema.index({ location: '2dsphere' });
LocationSchema.index({ userId: 1 });
