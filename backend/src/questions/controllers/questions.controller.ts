// questions/controllers/questions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuestionsService } from '../services/questions.service';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  /**
   * 创建一个新的题目
   * @param createQuestionDto 题目创建的数据传输对象
   * @returns 创建后的题目文档
   */
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    return await this.questionsService.create(createQuestionDto);
  }

  /**
   * 获取所有题目，支持分页和筛选
   * @param page 页码，默认为 1
   * @param limit 每页数量，默认为 10
   * @param category 分类，可选
   * @param difficulty 难度，可选
   * @returns 包含题目数据和总数的对象
   */
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: 'Easy' | 'Medium' | 'Hard',
  ) {
    // 确保页码和限制为正整数
    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;

    return await this.questionsService.findAll({
      page,
      limit,
      category,
      difficulty,
    });
  }

  /**
   * 搜索题目，支持根据关键词在标题、描述或标签中进行全文搜索
   * @param q 搜索关键词
   * @returns 匹配的题目文档数组
   */
  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) {
      return {
        data: [],
        total: 0,
      };
    }
    const results = await this.questionsService.search(query);
    return {
      data: results,
      total: results.length,
    };
  }

  /**
   * 根据 ID 获取特定题目
   * @param id 题目 ID
   * @returns 找到的题目文档
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.questionsService.findOne(id);
  }

  /**
   * 更新一个题目
   * @param id 题目 ID
   * @param updateQuestionDto 更新的数据传输对象
   * @returns 更新后的题目文档
   */
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.questionsService.update(id, updateQuestionDto);
  }

  /**
   * 删除一个题目
   * @param id 题目 ID
   * @returns 被删除的题目文档
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 返回 204 状态码，无内容
  async remove(@Param('id') id: string) {
    await this.questionsService.remove(id);
    // 根据 RESTful 规范，删除操作通常返回 204 No Content
  }
}
