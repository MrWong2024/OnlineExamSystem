// questions/services/questions.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Question, QuestionDocument } from '../schemas/question.schema';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  /**
   * 创建一个新的题目
   * @param createQuestionDto 创建题目的数据传输对象
   * @returns 创建后的题目文档
   */
  async create(
    createQuestionDto: CreateQuestionDto,
  ): Promise<QuestionDocument> {
    const { title } = createQuestionDto;

    // 检查标题是否已存在
    const existingQuestion = await this.questionModel.findOne({ title }).exec();
    if (existingQuestion) {
      throw new ConflictException('题目标题已存在');
    }

    try {
      const createdQuestion = new this.questionModel(createQuestionDto);
      return await createdQuestion.save();
    } catch (error) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.title) {
        // 处理重复键错误
        throw new ConflictException('题目标题已存在');
      }
      // 处理其他类型的错误
      throw new BadRequestException('题目创建失败');
    }
  }

  /**
   * 根据标题查找题目
   * @param title 题目标题
   * @returns 找到的题目文档或 null
   */
  async findByTitle(title: string): Promise<QuestionDocument | null> {
    return this.questionModel.findOne({ title }).exec();
  }

  /**
   * 获取所有题目，支持分页和筛选
   * @param options 查询选项，包括分页和筛选参数
   * @returns 包含题目数据和总数的对象
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    category?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
  }): Promise<{ data: QuestionDocument[]; total: number }> {
    const { page = 1, limit = 10, category, difficulty } = options;

    const filter: FilterQuery<QuestionDocument> = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const data = await this.questionModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.questionModel.countDocuments(filter).exec();

    return { data, total };
  }

  /**
   * 根据 ID 获取单个题目
   * @param id 题目 ID
   * @returns 找到的题目文档
   */
  async findOne(id: string): Promise<QuestionDocument> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException('题目未找到');
    }
    return question;
  }

  /**
   * 更新一个题目
   * @param id 题目 ID
   * @param updateQuestionDto 更新数据传输对象
   * @returns 更新后的题目文档
   */
  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<QuestionDocument> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException('题目未找到');
    }

    Object.assign(question, updateQuestionDto);

    try {
      return await question.save();
    } catch (error) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.title) {
        throw new ConflictException('题目标题已存在');
      }
      throw new BadRequestException('题目更新失败');
    }
  }

  /**
   * 删除一个题目
   * @param id 题目 ID
   * @returns 被删除的题目文档
   */
  async remove(id: string): Promise<QuestionDocument> {
    const question = await this.questionModel.findByIdAndDelete(id).exec();
    if (!question) {
      throw new NotFoundException('题目未找到');
    }
    return question;
  }

  /**
   * 搜索题目，支持根据标题、描述或标签关键词搜索
   * @param query 搜索关键词
   * @returns 匹配的题目文档数组
   */
  async search(query: string): Promise<QuestionDocument[]> {
    return this.questionModel
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } },
        ],
      })
      .exec();
  }
}
