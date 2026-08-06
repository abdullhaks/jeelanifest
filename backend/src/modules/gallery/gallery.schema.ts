import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GalleryImageDocument = GalleryImage & Document;

@Schema({ timestamps: true })
export class GalleryImage {
  @Prop({ required: true })
  image: string;

  @Prop({ trim: true, default: '' })
  description?: string;
}

export const GalleryImageSchema = SchemaFactory.createForClass(GalleryImage);
