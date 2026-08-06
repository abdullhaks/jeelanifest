import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { GalleryImage, GalleryImageSchema } from './gallery.schema';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GalleryImage.name, schema: GalleryImageSchema }]),
    AuthModule,
    CloudinaryModule
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
