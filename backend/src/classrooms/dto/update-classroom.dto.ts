// backend/src/classrooms/dto/update-classroom.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateClassroomDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
