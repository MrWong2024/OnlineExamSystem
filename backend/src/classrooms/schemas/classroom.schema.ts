// backend/src/classrooms/schemas/classroom.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClassroomDocument = Classroom & Document;

@Schema()
export class Classroom {
  @Prop({ required: true })
  name: string; // 班级名称

  @Prop({ required: true, index: true })
  teacherId: string; // 归属教师

  @Prop({ required: true, index: true })
  courseId: string; // 所属课程

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ClassroomSchema = SchemaFactory.createForClass(Classroom);
