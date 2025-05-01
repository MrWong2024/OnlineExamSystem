// src/auth/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // 使用 email 作为用户名字段
      passReqToCallback: true, // 启用请求传递，否则验证回调函数只能接收用户名和密码两个参数
    });
  }

  async validate(req: any, email: string, password: string): Promise<any> {
    // 调用 AuthService.validateUser 进行邮箱和密码校验
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 从请求体中提取角色，并与用户实际角色比对
    const { role } = req.body;
    if (role && user.role !== role) {
      throw new UnauthorizedException('角色不匹配');
    }
    // Passport 框架接收到 return 出来的 user，就自动把它挂到 req.user 上
    return user;
  }
}
