// backend/src/classrooms/dto/create-classroom.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
