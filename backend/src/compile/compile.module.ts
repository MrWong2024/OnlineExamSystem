// compile.module.ts
import { Module } from '@nestjs/common';
import { CompileService } from './services/compile.service';
import { CompileController } from './controllers/compile.controller';
import { ContainerPoolService } from './services/container-pool.service';

@Module({
  providers: [CompileService, ContainerPoolService],
  controllers: [CompileController],
  exports: [ContainerPoolService],
})
export class CompileModule {}
