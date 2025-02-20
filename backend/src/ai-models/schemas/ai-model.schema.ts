import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AIModelDocument = AIModel & Document;

@Schema({ timestamps: true })
export class AIModel {
  @Prop({ required: true, unique: true })
  value: string;

  @Prop({ required: true })
  displayText: string;

  @Prop()
  description?: string;

  // 新增：模型类型（免费或付费）
  @Prop({ required: true, enum: ['free', 'paid'], default: 'free' })
  type: 'free' | 'paid';

  // 新增：仅对付费模型生效，标记使用该模型所需的用户级别
  @Prop({ required: false })
  requiredUserLevel?: number; // 1: 普通用户，2: 高级用户，3: 管理员等
}

export const AIModelSchema = SchemaFactory.createForClass(AIModel);
