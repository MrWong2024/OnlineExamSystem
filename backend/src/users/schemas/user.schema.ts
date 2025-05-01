// backend/src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  password: string; // 密码

  @Prop({ required: true, enum: ['admin', 'teacher', 'student'] })
  role: string; // 用户角色

  @Prop({ required: true })
  name: string; // 姓名

  @Prop()
  phone?: string; // 手机号

  @Prop({ unique: true, required: true })
  email: string; // 邮箱地址，确保唯一性

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({
    required: true,
    index: true,
  })
  identifier: string; // 统一的标识符字段（工号/学号）
}

export const UserSchema = SchemaFactory.createForClass(User);

// 在保存前检查并加密密码（仅当密码被修改时）
UserSchema.pre<UserDocument>('save', async function (next) {
  const user = this as UserDocument;

  // 验证 identifier 是否存在
  if (!user.identifier) {
    user.identifier = user.email.split('@')[0]; // 使用 email 的前缀作为 identifier
  }

  if (!user.name) {
    user.name = user.email.split('@')[0]; // 使用 email 的前缀作为 name
  }

  // 如果密码被修改，进行加密
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }

  next();
});
