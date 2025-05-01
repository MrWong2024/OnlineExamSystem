// src/auth/controllers/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
  Get,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersService } from '../../users/services/users.service';
import { CurrentUserPayload } from 'src/common/interfaces/current-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: CurrentUserPayload) {
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('refresh-token')
  async refreshToken(
    @CurrentUser() user: CurrentUserPayload,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const latestUser = await this.usersService.findOne(user.userId);
    const loginResult = await this.authService.login(latestUser);

    const hasAuthHeader = Boolean(req.headers['authorization']);

    if (!hasAuthHeader) {
      // cookie模式
      res.cookie('access_token', loginResult.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      });
      return {
        message: '刷新成功（cookie 模式）',
        user: loginResult.user, // ✅ 直接返回 loginResult.user
      };
    }

    // token模式
    return {
      access_token: loginResult.access_token,
      user: loginResult.user,
      message: '刷新成功（localStorage 模式）',
    };
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.authService.register(createUserDto);
    return { message: '注册成功', user: newUser };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 登录成功后，Passport 会把 user 挂在 req.user 上
    const loginResult = await this.authService.login((req as any).user);

    // 判断是否开启“自动登录”（使用 localStorage 模式）
    const useLocalStorage = req.body.autoLogin === true;

    if (!useLocalStorage) {
      // 使用 cookie 模式：写入 httpOnly session cookie
      res.cookie('access_token', loginResult.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // 生产环境改成 true（需要 HTTPS）
      });
      return { message: '登录成功（cookie 模式）', user: loginResult.user };
    }

    // 使用 localStorage 模式：直接返回 token，前端存 localStorage
    return {
      message: '登录成功（localStorage 模式）',
      access_token: loginResult.access_token,
      user: loginResult.user,
    };
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    // 清除 cookie 中的 access_token
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // 若上线请改为 true（https）
    });

    return { message: '已退出登录' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      user.userId,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
