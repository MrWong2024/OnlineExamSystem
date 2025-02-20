// ai-models/controllers/ai-models.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AIModel, AIModelDocument } from '../schemas/ai-model.schema';
import { CreateAiModelDto } from '../dto/create-ai-model.dto';
import { UpdateAiModelDto } from '../dto/update-ai-model.dto';

@Injectable()
export class AiModelsService {
  constructor(
    @InjectModel(AIModel.name)
    private readonly aiModelModel: Model<AIModelDocument>,
  ) {}

  async create(createDto: CreateAiModelDto): Promise<AIModelDocument> {
    // 如果是付费模型，确保有 requiredUserLevel 字段
    if (createDto.type === 'paid' && !createDto.requiredUserLevel) {
      throw new Error('Paid models require a user level.');
    }

    const created = new this.aiModelModel(createDto);
    return created.save();
  }

  async findAll(): Promise<AIModelDocument[]> {
    return this.aiModelModel.find().exec();
  }

  async findOne(id: string): Promise<AIModelDocument> {
    const found = await this.aiModelModel.findById(id).exec();
    if (!found) {
      throw new NotFoundException('AI Model not found');
    }
    return found;
  }

  async update(
    id: string,
    updateDto: UpdateAiModelDto,
  ): Promise<AIModelDocument> {
    // 如果是付费模型，确保有 requiredUserLevel 字段
    if (
      updateDto.type === 'paid' &&
      updateDto.requiredUserLevel === undefined
    ) {
      throw new Error('Paid models require a user level.');
    }

    const updated = await this.aiModelModel
      .findByIdAndUpdate(id, updateDto, {
        new: true,
      })
      .exec();
    if (!updated) {
      throw new NotFoundException('AI Model not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.aiModelModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('AI Model not found');
    }
  }

  // 验证模型是否有效
  async isValidModel(model: string): Promise<boolean> {
    const foundModel = await this.aiModelModel.findOne({ value: model }).exec();
    return foundModel !== null;
  }
}
