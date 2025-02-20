import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

export class CreateAiModelDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  displayText: string;

  @IsString()
  @IsOptional()
  description?: string;

  // 新增：模型类型（free 或 paid）
  @IsEnum(['free', 'paid'])
  type: 'free' | 'paid';

  // 新增：仅对付费模型生效，标记所需的用户级别
  @IsInt()
  @Min(1)
  @IsOptional()
  requiredUserLevel?: number;
}
