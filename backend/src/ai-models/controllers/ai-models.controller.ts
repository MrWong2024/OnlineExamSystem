// ai-models/controllers/ai-models.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AiModelsService } from '../services/ai-models.service';
import { CreateAiModelDto } from '../dto/create-ai-model.dto';
import { UpdateAiModelDto } from '../dto/update-ai-model.dto';

@Controller('ai-models')
export class AiModelsController {
  constructor(private readonly aiModelsService: AiModelsService) {}

  // 在 NestJS 中，静态路由应该放在动态路由之前，否则像 /validate 这样的请求会被动态路由 /:id 捕获，并将 "validate" 视为 id 传入 findOne 方法。
  // 新增验证接口：传入 model 参数，返回 { valid: boolean }
  @Get('validate')
  async validateModel(@Query('model') model: string) {
    if (!model) {
      throw new BadRequestException('No model provided');
    }
    const isValid = await this.aiModelsService.isValidModel(model);
    return { valid: isValid };
  }

  @Post()
  async create(@Body() createDto: CreateAiModelDto) {
    return this.aiModelsService.create(createDto);
  }

  @Get()
  async findAll() {
    return this.aiModelsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.aiModelsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateAiModelDto) {
    return this.aiModelsService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.aiModelsService.remove(id);
  }
}
