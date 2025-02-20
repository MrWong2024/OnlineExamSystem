// backend/src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  password: string; // 密码

  @Prop({ required: true, enum: ['admin', 'teacher', 'student'] })
  role: string;

  @Prop({ required: true })
  name: string; // 姓名

  @Prop()
  phone?: string; // 手机号

  @Prop()
  email?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  // 统一的标识符字段，用于存储工号或学号
  @Prop({
    unique: true,
    required: true,
    index: true,
  })
  identifier: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 在保存前加密密码
UserSchema.pre<UserDocument>('save', async function (next) {
  const user = this as UserDocument;

  // 验证 identifier 是否存在
  if (!user.identifier) {
    return next(new Error('用户必须提供唯一标识符'));
  }

  // 检查 identifier 是否在数据库中已存在
  const UserModel = user.constructor as Model<UserDocument>;
  const existingUser = await UserModel.findOne({ identifier: user.identifier });

  if (existingUser && existingUser._id.toString() !== user._id.toString()) {
    return next(new Error('该标识符已被使用'));
  }

  // 如果密码被修改，进行加密
  if (this.isModified('password')) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});
