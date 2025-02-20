// src/questions/schemas/question.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  difficulty: 'Easy' | 'Medium' | 'Hard';

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  acceptanceRate: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  examples: string;

  @Prop({ required: true })
  solution: string;

  // 明确声明 timestamps 属性
  createdAt?: Date;
  updatedAt?: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// 添加全文索引
QuestionSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 5, description: 1, tags: 3 } },
);
