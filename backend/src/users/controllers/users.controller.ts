// users/controllers/users.controller.ts
import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 只有管理员可以创建用户
  @Roles('admin')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 管理员和教师可以查看所有用户
  @Roles('admin', 'teacher')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // 定义其他路由，例如 GET /users/:id、PUT /users/:id、DELETE /users/:id 等
  // 用户可以查看自己的信息，管理员可以查看任何用户的信息
  @Roles('admin', 'teacher', 'student')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // 只有管理员可以更新用户信息
  @Roles('admin')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // 只有管理员可以删除用户
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
