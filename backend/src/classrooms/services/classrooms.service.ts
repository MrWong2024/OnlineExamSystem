// backend/src/classrooms/services/classrooms.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Classroom, ClassroomDocument } from '../schemas/classroom.schema';
import { Course, CourseDocument } from '../../courses/schemas/course.schema';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectModel(Classroom.name)
    private classroomModel: Model<ClassroomDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  // 获取课程下的所有班级
  async findAllByCourse(
    teacherId: string,
    courseId: string,
  ): Promise<ClassroomDocument[]> {
    return this.classroomModel
      .find({ teacherId, courseId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // 创建班级
  async create(
    name: string,
    teacherId: string,
    courseId: string,
  ): Promise<ClassroomDocument> {
    const course = await this.courseModel.findById(courseId);
    if (!course || course.teacherId !== teacherId) {
      throw new ForbiddenException('无权限访问该课程');
    }

    const classroom = new this.classroomModel({ name, teacherId, courseId });
    return classroom.save();
  }

  // 更新班级
  async update(
    id: string,
    name: string,
    teacherId: string,
  ): Promise<ClassroomDocument> {
    const classroom = await this.classroomModel.findById(id);
    if (!classroom) throw new NotFoundException('班级不存在');
    if (classroom.teacherId !== teacherId)
      throw new ForbiddenException('无权限');

    classroom.name = name;
    return classroom.save();
  }

  // 删除班级
  async delete(id: string, teacherId: string): Promise<void> {
    const classroom = await this.classroomModel.findById(id);
    if (!classroom) throw new NotFoundException('班级不存在');
    if (classroom.teacherId !== teacherId)
      throw new ForbiddenException('无权限');

    await classroom.deleteOne();
  }
}
