import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // ✅ 引入
import { SemestersController } from './controllers/semesters.controller';
import { SemestersService } from './services/semesters.service';
import { Semester, SemesterSchema } from './schemas/semester.schema'; // ✅ 引入 schema
import { Course, CourseSchema } from 'src/courses/schemas/course.schema';
import {
  Classroom,
  ClassroomSchema,
} from 'src/classrooms/schemas/classroom.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Semester.name, schema: SemesterSchema },
      { name: Course.name, schema: CourseSchema }, // ✅ 这行一定要加
      { name: Classroom.name, schema: ClassroomSchema }, // ✅ 如果有班级也需要加
    ]), // ✅ 注册 Model
  ],
  controllers: [SemestersController],
  providers: [SemestersService],
  exports: [SemestersService], // 可选，看你后面是否要在其他模块用这个 Service
})
export class SemestersModule {}
