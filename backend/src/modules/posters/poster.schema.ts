import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PosterDocument = Poster & Document;

@Schema({ timestamps: true })
export class Poster {
  @Prop({ trim: true, default: '' })
  title?: string;

  @Prop({ trim: true, default: '' })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Competition', default: null })
  competition?: Types.ObjectId;

  @Prop({ required: true })
  image: string;
}

export const PosterSchema = SchemaFactory.createForClass(Poster);
