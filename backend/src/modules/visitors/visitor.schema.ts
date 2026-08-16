import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VisitorCountDocument = VisitorCount & Document;

@Schema({ timestamps: true })
export class VisitorCount {
  @Prop({ required: true, default: 'site_visitors', unique: true })
  key: string;

  @Prop({ required: true, default: 0 })
  count: number;
}

export const VisitorCountSchema = SchemaFactory.createForClass(VisitorCount);
