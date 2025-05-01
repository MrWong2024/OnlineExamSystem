// src/semesters/schemas/semester.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SemesterDocument = Semester & Document;

@Schema()
export class Semester {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  teacherId: string; // 👉 学期归属教师

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const SemesterSchema = SchemaFactory.createForClass(Semester);
