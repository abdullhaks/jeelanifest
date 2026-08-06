import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompetitionDocument = Competition & Document;

export type CompetitionType = 'group' | 'individual';
export type CompetitionStage = 'stage1' | 'stage2' | 'offStage' | null;
export type CompetitionStatus = 'upcoming' | 'started' | 'ended';
export type CompetitionCategory = 'subJunior' | 'junior' | 'senior' | 'general' | null;

@Schema({ timestamps: true })
export class Competition {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ['group', 'individual'] })
  type: CompetitionType;

  @Prop({ type: String, enum: ['subJunior', 'junior', 'senior', 'general', null], default: null })
  category: CompetitionCategory;

  @Prop({ trim: true })
  date?: string; // Optional

  @Prop({ trim: true })
  time?: string; // Optional

  @Prop({ type: String, enum: ['stage1', 'stage2', 'offStage', null], default: null })
  stage: CompetitionStage;

  @Prop({ type: String, enum: ['upcoming', 'started', 'ended'], default: 'upcoming' })
  status: CompetitionStatus;

  @Prop({ type: [{ group: { type: Types.ObjectId, ref: 'Group' }, chestCodes: [String] }], default: [] })
  groupEntries: { group: Types.ObjectId, chestCodes: string[] }[];
}

export const CompetitionSchema = SchemaFactory.createForClass(Competition);
