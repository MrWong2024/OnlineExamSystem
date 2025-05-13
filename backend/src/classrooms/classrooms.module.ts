import { Module } from '@nestjs/common';
import { ClassroomsService } from './services/classrooms.service';
import { ClassroomsController } from './controllers/classrooms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Classroom, ClassroomSchema } from './schemas/classroom.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema'; // ✅ 引入 Course 模型

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Classroom.name, schema: ClassroomSchema },
      { name: Course.name, schema: CourseSchema }, // ✅ 添加课程模型
    ]),
  ],
  controllers: [ClassroomsController],
  providers: [ClassroomsService],
  exports: [ClassroomsService], // 导出 UsersService
})
export class ClassroomsModule {}
