// src/questions/dto/create-question.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['Easy', 'Medium', 'Hard'])
  difficulty: 'Easy' | 'Medium' | 'Hard';

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  acceptanceRate: number;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsNotEmpty()
  examples: string;

  @IsString()
  @IsNotEmpty()
  solution: string;
}
