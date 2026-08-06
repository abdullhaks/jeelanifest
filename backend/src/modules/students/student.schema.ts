import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentDocument = Student & Document;

export type StudentCategory = 'subJunior' | 'junior' | 'senior';
export type RankAwarded = '1st' | '2nd' | '3rd' | null;

@Schema({ _id: false })
export class StudentProgram {
  @Prop({ type: Types.ObjectId, ref: 'Competition', required: true })
  competition: Types.ObjectId;

  @Prop({ type: String, enum: ['1st', '2nd', '3rd', null], default: null })
  rankAwarded: RankAwarded;
}

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  chestNo?: string;

  @Prop({ required: true, trim: true })
  class: string;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  group: Types.ObjectId;

  @Prop({ required: true, enum: ['subJunior', 'junior', 'senior'] })
  category: StudentCategory;

  @Prop({ type: String, default: null })
  profileImage?: string;

  @Prop({ type: Number, default: 0 })
  points: number;

  @Prop({ type: [StudentProgram], default: [] })
  programs: StudentProgram[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);
