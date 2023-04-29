import { Module } from '@nestjs/common';
import { CloudinaryService } from './service/cloudinary.service';
import { CloudinaryController } from './controller/cloudinary.controller';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: diskStorage({
        destination: '/tmp',
        filename: (req, file, cb) => {
          const filename: string = file.originalname.replace(/\s+/g, '-');
          cb(null, `${filename}`);
        },
      }),
    }),
  ],
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
})
export class ImageModule {}
