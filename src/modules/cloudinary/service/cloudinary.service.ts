import { v2 as cloudinary } from 'cloudinary';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }
  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No File Uploaded');
    }
    if (!file.mimetype.startsWith('image')) {
      throw new BadRequestException('Please Upload Image');
    }

    const stream = new Readable();
    stream.push(file.buffer);
    stream.push(null);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {folder: 'image-upload'},
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({ image: result.secure_url });
          }
        },
      );

      stream.pipe(uploadStream);
    });
  }
}
