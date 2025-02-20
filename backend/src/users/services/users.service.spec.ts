// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userModel: Model<UserDocument>;

  const mockUser = {
    _id: 'someUserId',
    password: 'hashedPassword',
    role: 'student',
    name: '张三',
    identifier: 'stu001',
    createdAt: new Date(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('成功创建用户', async () => {
      const createUserDto: CreateUserDto = {
        password: '123456',
        role: 'student',
        name: '李四',
        identifier: 'stu002',
      };
      mockUserModel.findOne.mockResolvedValueOnce(null);
      mockUserModel.create.mockResolvedValueOnce({
        ...createUserDto,
        _id: 'newUserId',
      });

      const result = await service.create(createUserDto);
      expect(result._id).toBe('newUserId');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        identifier: 'stu002',
      });
      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
    });

    it('重复标识符导致冲突异常', async () => {
      const createUserDto: CreateUserDto = {
        password: '123456',
        role: 'student',
        name: '李四',
        identifier: 'stu001',
      };
      mockUserModel.findOne.mockResolvedValueOnce(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('创建时发生其他错误导致 BadRequestException', async () => {
      const createUserDto: CreateUserDto = {
        password: '123456',
        role: 'student',
        name: '李四',
        identifier: 'stu003',
      };
      mockUserModel.findOne.mockResolvedValueOnce(null);
      mockUserModel.create.mockRejectedValueOnce(new Error('Some Error'));

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByIdentifier', () => {
    it('根据 identifier 查找用户', async () => {
      // mockUserModel.findOne.mockResolvedValueOnce(mockUser);
      mockUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockUser), // 当查找到用户时
      });
      const result = await service.findByIdentifier('stu001');
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        identifier: 'stu001',
      });
    });

    it('未找到用户返回 null', async () => {
      // mockUserModel.findOne.mockResolvedValueOnce(null);
      mockUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null), // 当查不到用户时
      });
      const result = await service.findByIdentifier('unknown');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('返回用户列表', async () => {
      mockUserModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([mockUser]),
      });
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('根据 ID 查找用户成功', async () => {
      mockUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      });
      const result = await service.findOne('someUserId');
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('someUserId');
    });

    it('未找到用户抛出 NotFoundException', async () => {
      mockUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      });
      await expect(service.findOne('unknownId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('成功更新用户信息', async () => {
      const updateUserDto: UpdateUserDto = { name: '王五' };

      const mockUserDoc = {
        ...mockUser,
        save: jest.fn().mockResolvedValue({ ...mockUser, name: '王五' }),
      };
      mockUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockUserDoc),
      });

      const result = await service.update('someUserId', updateUserDto);
      expect(result.name).toBe('王五');
      expect(mockUserDoc.save).toHaveBeenCalled();
    });

    it('更新不存在的用户抛出 NotFoundException', async () => {
      mockUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      });
      await expect(
        service.update('unknownId', { name: '王五' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('更新时标识符冲突抛出 ConflictException', async () => {
      const updateUserDto: UpdateUserDto = { identifier: 'alreadyExist' };

      const mockUserDoc = {
        ...mockUser,
        save: jest
          .fn()
          .mockRejectedValue({ code: 11000, keyPattern: { identifier: 1 } }),
      };
      mockUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockUserDoc),
      });

      await expect(service.update('someUserId', updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('更新发生其他错误抛出 BadRequestException', async () => {
      const updateUserDto: UpdateUserDto = { name: '王五' };

      const mockUserDoc = {
        ...mockUser,
        save: jest.fn().mockRejectedValue(new Error('Other Error')),
      };
      mockUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockUserDoc),
      });

      await expect(service.update('someUserId', updateUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('成功删除用户', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      });

      const result = await service.delete('someUserId');
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        'someUserId',
      );
    });

    it('删除不存在的用户抛出 NotFoundException', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.delete('unknownId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
