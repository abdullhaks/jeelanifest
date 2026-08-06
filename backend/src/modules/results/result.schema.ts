import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResultDocument = Result & Document;

export type ResultRank = '1st' | '2nd' | '3rd';
export type ParticipantType = 'Student' | 'Group';

@Schema({ _id: false })
export class Winner {
  @Prop({ required: true, enum: ['1st', '2nd', '3rd'] })
  rank: ResultRank;

  @Prop({ required: true, enum: ['Student', 'Group'] })
  participantType: ParticipantType;

  @Prop({ type: String })
  chestCode?: string;

  @Prop({ type: Types.ObjectId, required: true, refPath: 'winners.participantType' })
  participant: Types.ObjectId;
  
  @Prop({ type: Number, required: true, default: 0 })
  pointsAwarded: number;
}

@Schema({ timestamps: true })
export class Result {
  @Prop({ type: Types.ObjectId, ref: 'Competition', required: true, unique: true })
  competition: Types.ObjectId;

  @Prop({ required: true, enum: ['draft', 'published'], default: 'draft' })
  status: 'draft' | 'published';

  @Prop({ type: [Winner], default: [] })
  winners: Winner[];
}

export const ResultSchema = SchemaFactory.createForClass(Result);
