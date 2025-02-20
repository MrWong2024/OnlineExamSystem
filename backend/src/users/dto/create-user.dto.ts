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
  role: string;

  @IsString()
  @IsNotEmpty()
  name: string; // 姓名

  @IsString()
  @IsOptional()
  phone?: string; // 手机号

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  identifier: string; // 统一的标识符字段
}
