import { Test, TestingModule } from '@nestjs/testing';
import { AiModelsController } from './ai-models.controller';

describe('AiModelsController', () => {
  let controller: AiModelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiModelsController],
    }).compile();

    controller = module.get<AiModelsController>(AiModelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
