// src/semesters/dto/update-semester.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSemesterDto {
  @IsString()
  @IsNotEmpty()
  name?: string;
}
