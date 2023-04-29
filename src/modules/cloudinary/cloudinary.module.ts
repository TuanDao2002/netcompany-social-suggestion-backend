import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryController } from './controller/cloudinary.controller';
import { CloudinaryService } from './service/cloudinary.service';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
})
export class ImageModule {}
