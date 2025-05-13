// backend/src/courses/dto/update-course.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
