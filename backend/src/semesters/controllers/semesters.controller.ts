// src/semesters/controllers/semesters.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SemestersService } from '../services/semesters.service';
import { CreateSemesterDto } from '../dto/create-semester.dto';
import { UpdateSemesterDto } from '../dto/update-semester.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUserPayload } from '../../common/interfaces/current-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher', 'admin')
@Controller('semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.semestersService.findAllByTeacher(user.userId);
  }

  @Post()
  create(
    @Body() createSemesterDto: CreateSemesterDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.semestersService.create(createSemesterDto, user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSemesterDto: UpdateSemesterDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.semestersService.update(id, updateSemesterDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.semestersService.remove(id, user.userId);
  }
}
