// src/semesters/services/semesters.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Semester, SemesterDocument } from '../schemas/semester.schema';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../../courses/schemas/course.schema';
import {
  Classroom,
  ClassroomDocument,
} from '../../classrooms/schemas/classroom.schema';

@Injectable()
export class SemestersService {
  constructor(
    @InjectModel(Semester.name) private semesterModel: Model<SemesterDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Classroom.name)
    private classroomModel: Model<ClassroomDocument>,
  ) {}

  // 查找教师的所有学期
  async findAllByTeacher(teacherId: string): Promise<SemesterDocument[]> {
    return this.semesterModel
      .find({ teacherId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /*
  update 和 create 直接传入 name 和 teacherId，不要传 DTO（因为 DTO 只是前端来的原始数据，不能直接当内部数据结构用）。
  这样更加职责清晰，避免 DTO 滥用。
  */
  // 创建学期（teacherId 由 Controller 传入）
  async create(name: string, teacherId: string): Promise<SemesterDocument> {
    const created = new this.semesterModel({ name, teacherId });
    return created.save();
  }

  // 更新学期
  async update(
    id: string,
    name: string,
    teacherId: string,
  ): Promise<SemesterDocument> {
    const semester = await this.semesterModel.findById(id);
    if (!semester) throw new NotFoundException('学期不存在');
    if (semester.teacherId !== teacherId)
      throw new ForbiddenException('你没有权限修改这个学期');

    semester.name = name;
    return semester.save();
  }

  // 删除学期
  async delete(id: string, teacherId: string): Promise<void> {
    const semester = await this.semesterModel.findById(id);
    if (!semester) throw new NotFoundException('学期不存在');
    if (semester.teacherId !== teacherId)
      throw new ForbiddenException('你没有权限删除这个学期');

    // ✅ 级联删除课程
    const courses = await this.courseModel.find({ semesterId: id });
    for (const course of courses) {
      await this.deleteCourseCascade(course._id.toString(), teacherId);
    }

    await semester.deleteOne();
  }

  // ✅ 课程删除（带班级级联删除）
  private async deleteCourseCascade(id: string, teacherId: string) {
    const course = await this.courseModel.findById(id);
    if (!course) return; // 理论上不会发生
    if (course.teacherId !== teacherId)
      throw new ForbiddenException('无权限删除课程');

    // 删除班级
    await this.classroomModel.deleteMany({ courseId: id });

    // 删除课程
    await course.deleteOne();
  }
}
