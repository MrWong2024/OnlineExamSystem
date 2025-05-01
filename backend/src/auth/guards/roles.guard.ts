// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // 如果没有指定角色，默认允许访问
    }

    // 获取请求中的 user（由 JwtAuthGuard 提供）
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
