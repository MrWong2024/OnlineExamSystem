import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModelsService } from './services/ai-models.service';
import { AiModelsController } from './controllers/ai-models.controller';
import { AIModel, AIModelSchema } from './schemas/ai-model.schema';

@Module({
  imports: [
    // 注册 AIModel 的 Schema，指定集合名
    MongooseModule.forFeature([{ name: AIModel.name, schema: AIModelSchema }]),
  ],
  providers: [AiModelsService],
  controllers: [AiModelsController],
})
export class AiModelsModule {}
