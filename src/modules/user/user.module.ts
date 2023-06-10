import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/users.schema';
import { AuthModule } from '../auth/auth.module';
import { LocationRepository } from '../location/repository/location.repository';
import { Location, LocationSchema } from '../location/schema/locations.schema';
import { LikeLocationService } from '../location/service/like-location.service';
import { LikeLocationRepository } from '../location/repository/like-location.repository';
import { LikeLocation, LikeLocationSchema } from "../location/schema/like-location.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Location.name, schema: LocationSchema },
      { name: LikeLocation.name, schema: LikeLocationSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    LocationRepository,
    LikeLocationService,
    LikeLocationRepository,
  ],
  exports: [UserRepository],
})
export class UserModule {}
