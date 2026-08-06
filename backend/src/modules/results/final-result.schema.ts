import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FinalResultDocument = FinalResult & Document;

@Schema({ timestamps: true })
export class FinalResult {
  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  firstPlaceGroup: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  secondPlaceGroup: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  thirdPlaceGroup: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  publishedAt: Date;
}

export const FinalResultSchema = SchemaFactory.createForClass(FinalResult);
