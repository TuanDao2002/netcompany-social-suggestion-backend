import { ImageModule } from './modules/cloudinary/cloudinary.module';
import { UserModule } from './modules/user/user.module';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';

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
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
