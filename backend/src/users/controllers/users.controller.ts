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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUserPayload } from 'src/common/interfaces/current-user.interface';
import { UpdateProfileDto } from '../dto/update-profile.dto';

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
  // 所有人都能访问自己的信息
  @Roles('admin', 'teacher', 'student')
  @Get('me')
  getMyProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.findOne(user.userId);
  }

  // 仅管理员可查任意用户信息
  @Roles('admin')
  @Get(':id')
  getUserByAdmin(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /*
  场景              | 路由设计        | 谁能访问      | 获取用户ID方式
  管理员更新任意用户 | PUT /users/:id | 仅 admin      | 从参数获取
  用户修改自己的资料 | PUT /users/me  | 仅当前登录用户 | 从 JWT 中解析 userId
  */
  // ✅ 当前登录用户更新自己的资料
  @Roles('admin', 'teacher', 'student')
  @Put('me')
  updateMyProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.update(user.userId, updateProfileDto);
  }

  // 只有管理员可以更新用户信息
  // ✅ 管理员更新任意用户
  @Roles('admin')
  @Put(':id')
  updateUserByAdmin(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // 只有管理员可以删除用户
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
