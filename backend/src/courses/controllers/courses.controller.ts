// backend/src/courses/controllers/courses.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CoursesService } from '../services/courses.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interfaces/current-user.interface';
import { CreateCourseDto } from '../dto/create- course.dto';
import { UpdateCourseDto } from '../dto/update- course.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher', 'admin')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('semesterId') semesterId: string,
  ) {
    return this.coursesService.findAllBySemester(user.userId, semesterId);
  }

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() createCourseDto: CreateCourseDto,
    @Query('semesterId') semesterId: string,
  ) {
    return this.coursesService.create(
      createCourseDto.name,
      user.userId,
      semesterId,
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto.name, user.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.coursesService.delete(id, user.userId);
  }
}
