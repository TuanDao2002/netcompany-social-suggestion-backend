import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/users.schema';
import { AuthModule } from '../auth/auth.module';
import { LocationRepository } from '../location/repository/location.repository';
import { Location, LocationSchema } from '../location/schema/locations.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Location.name, schema: LocationSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, LocationRepository],
  exports: [UserRepository],
})
export class UserModule {}
