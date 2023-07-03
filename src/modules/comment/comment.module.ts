import { Module } from '@nestjs/common';
import { CommentController } from './controller/comment.controller';
import { CommentService } from './service/comment.service';
import { Comment, CommentSchema } from './schema/comment.schema';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentRepository } from "./repository/comment.repository";
import { Location, LocationSchema } from '../location/schema/locations.schema';
import { LocationRepository } from '../location/repository/location.repository';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema }, 
      { name: Location.name, schema: LocationSchema }
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository, LocationRepository],
})
export class CommentModule {}
