// backend/src/courses/schemas/course.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema()
export class Course {
  @Prop({ required: true })
  name: string; // 课程名称

  @Prop({ required: true, index: true })
  teacherId: string; // 归属教师（同学期）

  @Prop({ required: true, index: true })
  semesterId: string; // 所属学期

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
