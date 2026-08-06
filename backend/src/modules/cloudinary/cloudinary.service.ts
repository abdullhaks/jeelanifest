import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
    console.log('☁️  Cloudinary configured');
  }

  /**
   * Upload an image buffer to Cloudinary.
   * @param buffer - The file buffer to upload
   * @param folder - The Cloudinary folder to organize uploads (e.g. 'groups', 'students', 'posters')
   * @returns The Cloudinary upload response with url, public_id, etc.
   */
  async uploadImage(buffer: Buffer, folder: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `jeelanifest/${folder}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload failed'));
          } else {
            resolve(result);
          }
        },
      );
      uploadStream.end(buffer);
    });
  }

  /**
   * Destroy an image on Cloudinary by its public_id.
   */
  async destroyImage(publicId: string): Promise<{ result: string }> {
    return cloudinary.uploader.destroy(publicId);
  }
}
