import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }
  async uploadImage(file: Express.Multer.File): Promise<{ image: string }> {
    if (!file) {
      throw new BadRequestException('No File Uploaded');
    }
    if (!file.mimetype.startsWith('image')) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('Please Upload Image');
    }

    const result = await cloudinary.uploader.upload(file.path, {
      use_filename: true,
      folder: 'file-upload',
    });

    fs.unlinkSync(file.path);

    return { image: result.secure_url };
  }
}
