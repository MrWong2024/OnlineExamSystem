import { Test, TestingModule } from '@nestjs/testing';
import { CompileController } from './compile.controller';

describe('CompileController', () => {
  let controller: CompileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompileController],
    }).compile();

    controller = module.get<CompileController>(CompileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
