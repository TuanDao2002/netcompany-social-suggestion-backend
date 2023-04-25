import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/users.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
