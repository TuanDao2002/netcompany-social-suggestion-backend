import { PusherService } from './modules/notification/service/pusher.service';
import { PusherController } from './modules/notification/controller/pusher.controller';
import { NotificationModule } from './modules/notification/notification.module';
import { CommentModule } from './modules/comment/comment.module';
import { EventModule } from './modules/event/event.module';
import { LocationModule } from './modules/location/location.module';
import { ImageModule } from './modules/cloudinary/cloudinary.module';
import { UserModule } from './modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ItineraryModule } from './modules/itinerary/itinerary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'src/config/.env',
      isGlobal: true,
    }),
    DatabaseModule,
    ImageModule,
    UserModule,
    AuthModule,
    LocationModule,
    EventModule,
    ItineraryModule,
    CommentModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
