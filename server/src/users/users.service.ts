// src/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 获取所有用户
   * @param role 可选的角色筛选
   */
  async findAll(role?: string) {
    const where = role ? { role: role as UserRole } : {};
    return this.userRepository.find({ where });
  }

  /**
   * 根据ID获取单个用户
   * @param id 用户ID
   */
  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param updateData 更新数据
   */
  async update(id: number, updateData: Partial<User>) {
    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * 禁用用户
   * @param id 用户ID
   */
  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.update(id, { isActive: false });
    return { message: '用户已禁用' };
  }

  /**
   * 获取可用员工列表
   * 使用 QueryBuilder 来避免 TypeScript 类型检查问题
   * @param shopId 可选的门店ID,如果提供则只返回该门店的员工
   * @returns 可用员工列表
   */
  async getAvailableWorkers(shopId?: number) {
  console.log('查询可用员工, shopId:', shopId);
  
  const queryBuilder = this.userRepository
    .createQueryBuilder('user')
    .where('user.role = :role', { role: 'worker' })  // ✅ 直接查询 employee
    .andWhere('user.is_active = :isActive', { isActive: true })
    .orderBy('user.id', 'ASC');

  if (shopId) {
    queryBuilder.andWhere('user.shop_id = :shopId', { shopId });
  }

  const workers = await queryBuilder.getMany();
  console.log(`找到 ${workers.length} 个可用员工`);
  
  return workers;
}
  
}