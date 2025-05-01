// src/semesters/services/semesters.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Semester, SemesterDocument } from '../schemas/semester.schema';
import { Model } from 'mongoose';
import { CreateSemesterDto } from '../dto/create-semester.dto';
import { UpdateSemesterDto } from '../dto/update-semester.dto';

@Injectable()
export class SemestersService {
  constructor(
    @InjectModel(Semester.name) private semesterModel: Model<SemesterDocument>,
  ) {}

  // 查找当前教师的所有学期
  async findAllByTeacher(teacherId: string): Promise<Semester[]> {
    return this.semesterModel
      .find({ teacherId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // 创建新的学期
  async create(
    createSemesterDto: CreateSemesterDto,
    teacherId: string,
  ): Promise<Semester> {
    const { name } = createSemesterDto; // 从 DTO 获取数据
    const created = new this.semesterModel({ name, teacherId });
    return created.save();
  }

  // 更新学期
  async update(
    id: string,
    updateSemesterDto: UpdateSemesterDto,
    teacherId: string,
  ): Promise<Semester> {
    const { name } = updateSemesterDto; // 从 DTO 获取数据
    const semester = await this.semesterModel.findById(id);
    if (!semester) throw new NotFoundException('学期不存在');
    if (semester.teacherId !== teacherId)
      throw new ForbiddenException('你没有权限修改这个学期');

    semester.name = name;
    return semester.save();
  }

  // 删除学期
  async remove(id: string, teacherId: string): Promise<void> {
    const semester = await this.semesterModel.findById(id);
    if (!semester) throw new NotFoundException('学期不存在');
    if (semester.teacherId !== teacherId)
      throw new ForbiddenException('你没有权限删除这个学期');

    await semester.deleteOne();
  }
}
