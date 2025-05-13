// backend/src/courses/services/courses.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../schemas/course.schema';
// ✅ 需要引入 semesterModel（用于验证归属）
import {
  Semester,
  SemesterDocument,
} from '../../semesters/schemas/semester.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Semester.name) private semesterModel: Model<SemesterDocument>,
  ) {}

  // 获取教师在指定学期下的所有课程
  async findAllBySemester(
    teacherId: string,
    semesterId: string,
  ): Promise<CourseDocument[]> {
    return this.courseModel
      .find({ teacherId, semesterId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // 创建课程
  async create(
    name: string,
    teacherId: string,
    semesterId: string,
  ): Promise<CourseDocument> {
    const semester = await this.semesterModel.findById(semesterId);
    if (!semester || semester.teacherId !== teacherId) {
      throw new ForbiddenException('无权限访问该学期');
    }
    const course = new this.courseModel({ name, teacherId, semesterId });
    return course.save();
  }

  // 更新课程
  async update(
    id: string,
    name: string,
    teacherId: string,
  ): Promise<CourseDocument> {
    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException('课程不存在');
    if (course.teacherId !== teacherId)
      throw new ForbiddenException('你没有权限修改这个课程');

    course.name = name;
    return course.save();
  }

  // 删除课程
  async delete(id: string, teacherId: string): Promise<void> {
    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException('课程不存在');
    if (course.teacherId !== teacherId)
      throw new ForbiddenException('你没有权限删除这个课程');

    await course.deleteOne();
  }
}
