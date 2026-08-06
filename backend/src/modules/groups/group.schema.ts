import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, default: null })
  logoUrl?: string;

  @Prop({ type: Number, default: 0 })
  totalPoints: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }], default: [] })
  members: Types.ObjectId[];

  // Ordered array: 0 = Main Leader, 1 = Assistant 1, 2 = Assistant 2
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }], default: [] })
  leaders: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
