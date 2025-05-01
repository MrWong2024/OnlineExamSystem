// src/semesters/dto/update-semester.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateSemesterDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;
}
