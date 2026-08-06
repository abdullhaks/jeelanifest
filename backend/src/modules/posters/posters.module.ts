import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostersController } from './posters.controller';
import { PostersService } from './posters.service';
import { Poster, PosterSchema } from './poster.schema';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Poster.name, schema: PosterSchema }]),
    AuthModule,
    CloudinaryModule
  ],
  controllers: [PostersController],
  providers: [PostersService],
})
export class PostersModule {}
