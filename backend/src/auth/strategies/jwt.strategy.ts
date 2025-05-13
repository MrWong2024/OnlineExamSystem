// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // 多 extractor：从 header 和 cookie 中提取 JWT
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token || null, // ✅ 优先从 cookie 中读取
        ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ 其次从 header 读取
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // 返回登录态用户信息，挂载到 req.user 上
    return {
      userId: payload.userId,
      name: payload.name,
      identifier: payload.identifier,
      role: payload.role,
    };
  }
}
