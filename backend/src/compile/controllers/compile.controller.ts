// compile.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CompileService } from '../services/compile.service';

@Controller('compile')
export class CompileController {
  constructor(private readonly compileService: CompileService) {}

  @Post()
  async compileCode(@Body('code') code: string) {
    const output = await this.compileService.compileAndRun(code);
    return { output };
  }
}
