import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LocationCategory } from '../../../common/location-category.enum';
import { SearchDistance } from '../../../common/search-distance.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({
    required: false,
    trim: true,
    unique: true,
    sparse: true, // only index this prop when it is not null
  })
  username: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
  })
  email: string;

  @Prop({ required: false, trim: true, default: "" })
  imageUrl: string;

  @Prop({
    type: [String],
    enum: [LocationCategory],
    default: [],
  })
  locationCategories: [LocationCategory];

  @Prop({ required: false, default: SearchDistance.MIN_DISTANCE })
  searchDistance: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index(
  { username: 1, email: 1 },
  {
    unique: true,
  },
);
