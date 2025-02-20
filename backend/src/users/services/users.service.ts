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

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { identifier } = createUserDto;

    // 检查标识符是否已存在
    const existingUser = await this.userModel.findOne({ identifier });
    if (existingUser) {
      throw new ConflictException('该标识符已被使用');
    }

    try {
      return await this.userModel.create(createUserDto);
    } catch (error) {
      if (
        error.code === 11000 &&
        error.keyPattern &&
        error.keyPattern.identifier
      ) {
        // 处理重复键错误
        throw new ConflictException('该标识符已被使用');
      }
      // 可以根据需要处理其他类型的错误
      throw new BadRequestException('用户创建失败');
    }
  }

  async findByIdentifier(identifier: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ identifier }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  // 根据 ID 查找单个用户
  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
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
      return await user.save();
    } catch (error) {
      if (
        error.code === 11000 &&
        error.keyPattern &&
        error.keyPattern.identifier
      ) {
        throw new ConflictException('该标识符已被使用');
      }
      throw new BadRequestException('用户更新失败');
    }
  }

  // 删除用户
  async delete(id: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException('用户未找到');
    }
    return user;
  }
}
