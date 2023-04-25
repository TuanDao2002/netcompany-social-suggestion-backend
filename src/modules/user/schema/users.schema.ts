import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LocationCategory } from '../../../common/location-category.enum';
import { SearchDistance } from '../../../common/search-distance.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({
    required: false,
    unique: true,
  })
  username: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  imageUrl: string;

  @Prop({
    type: [String],
    enum: [LocationCategory],
    default: [],
  })
  locationCategories: [LocationCategory];

  @Prop({ required: false, default: SearchDistance.DIS_5_KM })
  searchDistance: number;

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
    required: false,
  })
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ username: 1, email: 1 }, { unique: true });
