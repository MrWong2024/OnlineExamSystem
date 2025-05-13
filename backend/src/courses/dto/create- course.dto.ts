// backend/src/courses/dto/create-course.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
