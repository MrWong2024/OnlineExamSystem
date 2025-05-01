// users/services/users.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // 创建新用户
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // 自动生成 identifier 和 name
    const { email } = createUserDto;
    const identifier = email.split('@')[0]; // 自动从邮箱提取前缀作为 identifier
    const name = createUserDto.name || identifier; // 如果没有提供 name，则使用 identifier

    // ✅ 直接 new + save，确保触发 pre-save（保证密码加密等逻辑一定生效）
    const user = new this.userModel({
      ...createUserDto,
      identifier,
      name,
    });

    try {
      // 创建用户并保存
      return await user.save();
    } catch (error) {
      if (
        error.code === 11000 &&
        (error.keyPattern?.email || error.keyValue?.email)
      ) {
        // 处理重复键错误
        throw new ConflictException('该邮箱已被使用');
      }
      throw new BadRequestException('用户创建失败');
    }
  }

  // 添加根据 email 查找用户的方法
  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email });
    if (!includePassword) {
      query.select('-password');
    }
    return query.exec();
  }

  async findByIdentifier(identifier: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ identifier }).select('-password').exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password').exec();
  }

  // 根据 ID 查找单个用户
  async findOne(id: string, includePassword = false): Promise<UserDocument> {
    const query = this.userModel.findById(id);
    if (!includePassword) {
      query.select('-password');
    }
    const user = await query.exec();
    if (!user) {
      throw new NotFoundException('用户未找到');
    }
    return user;
  }

  // 更新用户信息
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('用户未找到');
    }

    Object.assign(user, updateUserDto);

    try {
      /*
        Mongoose 的 save() 机制是「脏检查 + 仅更新变更字段」
        Mongoose 会自动检测哪些字段被修改过（dirty fields）。
        只会将发生变化的字段发到 MongoDB，生成一个 $set 更新指令。
      */
      return await user.save();
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern?.email) {
          throw new ConflictException('该邮箱已被使用');
        }
      }
      throw new BadRequestException('用户更新失败');
    }
  }

  // 删除用户
  async delete(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndDelete(id)
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('用户未找到');
    }
    return user;
  }
}
