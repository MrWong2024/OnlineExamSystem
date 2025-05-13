// backend/src/classrooms/controllers/classrooms.controller.ts
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
import { ClassroomsService } from '../services/classrooms.service';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interfaces/current-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher', 'admin')
@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('courseId') courseId: string,
  ) {
    return this.classroomsService.findAllByCourse(user.userId, courseId);
  }

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() createClassroomDto: CreateClassroomDto,
    @Query('courseId') courseId: string,
  ) {
    return this.classroomsService.create(
      createClassroomDto.name,
      user.userId,
      courseId,
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() updateClassroomDto: UpdateClassroomDto,
  ) {
    return this.classroomsService.update(
      id,
      updateClassroomDto.name,
      user.userId,
    );
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.classroomsService.delete(id, user.userId);
  }
}
