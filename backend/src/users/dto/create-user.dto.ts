// backend/src/users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsIn,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  password: string; // 密码

  @IsString()
  @IsNotEmpty()
  @IsIn(['admin', 'teacher', 'student'])
  role: string; // 用户角色

  // name不能被标记为 @IsNotEmpty()，因为前端没有传递name，在进入AuthController的register方法前，NestJS 的管道验证器会抛出异常
  @IsString()
  @IsOptional()
  name: string; // 姓名

  @IsString()
  @IsOptional() // 允许手机号可选
  phone?: string; // 手机号

  @IsEmail()
  @IsNotEmpty() // 强制邮箱为必填
  email: string; // 邮箱地址，确保唯一性

  @IsString()
  @IsOptional() // identifier 可以自动生成，因此此处为可选
  identifier?: string; // 统一的标识符字段
}
