// auth/services/auth.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 验证用户
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email, true);
    if (!user) {
      throw new UnauthorizedException('邮箱不存在');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user.toObject();
    return result;
  }

  // 登录并生成 JWT
  async login(user: any) {
    const payload = {
      userId: user._id,
      name: user.name,
      identifier: user.identifier,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  // 注册用户
  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId, true);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('当前密码错误');
    }

    // ✅ 直接传递明文密码，让 UserSchema 自动 hash
    await this.usersService.update(userId, { password: newPassword });

    return { message: '密码修改成功' };
  }
}
