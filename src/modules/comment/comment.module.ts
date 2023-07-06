import { Module } from '@nestjs/common';
import { CommentController } from './controller/comment.controller';
import { CommentService } from './service/comment.service';
import { Comment, CommentSchema } from './schema/comment.schema';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentRepository } from './repository/comment.repository';
import { Location, LocationSchema } from '../location/schema/locations.schema';
import { LocationRepository } from '../location/repository/location.repository';
import { LikeComment, LikeCommentSchema } from './schema/like-comment.schema';
import { LikeCommentRepository } from './repository/like-comment.repository';
import { LikeCommentService } from './service/like-comment.service';
import { Reply, ReplySchema } from './schema/reply.schema';
import { User, UserSchema } from '../user/schema/users.schema';
import { UserRepository } from '../user/repository/user.repository';
import { ReplyService } from './service/reply.service';
import { ReplyRepository } from './repository/reply.repository';
import { ReplyController } from './controller/reply.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Reply.name, schema: ReplySchema },
      { name: LikeComment.name, schema: LikeCommentSchema },
      { name: Location.name, schema: LocationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CommentController, ReplyController],
  providers: [
    CommentService,
    CommentRepository,
    ReplyService,
    ReplyRepository,
    LikeCommentService,
    LikeCommentRepository,
    LocationRepository,
    UserRepository,
  ],
})
export class CommentModule {}
