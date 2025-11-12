// src/work-items/work-items.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkItem } from '../entities/work-item.entity';

@Injectable()
export class WorkItemsService {
  constructor(
    @InjectRepository(WorkItem)
    private workItemRepository: Repository<WorkItem>,
  ) {}

  async create(workOrderId: number, createDto: any) {
    // ✅ 验证必填字段
    if (!createDto.item_name || createDto.price === undefined) {
      throw new BadRequestException('缺少必填字段: item_name, price');
    }

    // ✅ 验证价格
    if (parseFloat(createDto.price) <= 0) {
      throw new BadRequestException('项目费用必须大于0');
    }

    // 字段名与 WorkItem 实体一致，数据库字段为 order_id，实体为 orderId
    const workItem = this.workItemRepository.create({
      
  orderId: workOrderId,
  name: createDto.item_name,
  description: createDto.description,
  price: parseFloat(createDto.price),
  status: createDto.status || 'pending'
    });
    return this.workItemRepository.save(workItem);
  }

  async findByWorkOrder(workOrderId: number) {
    // 字段名与 WorkItem 实体一致
    return this.workItemRepository.find({
      where: { orderId: workOrderId },
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ 新增：获取工作项列表（支持分页，用于小程序查询）
  async findByOrderId(orderId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.workItemRepository.findAndCount({
      where: { orderId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
    };
  }

  // ✅ 新增：计算工单的总费用
  async getTotalCostByOrderId(orderId: number) {
    const result = await this.workItemRepository
      .createQueryBuilder('work_item')
      .select('SUM(work_item.price)', 'total')
      .where('work_item.orderId = :orderId', { orderId })
      .getRawOne();

    return result?.total || 0;
  }

  async update(id: number, updateData: Partial<WorkItem>) {
    const workItem = await this.workItemRepository.findOne({ where: { id } });
    if (!workItem) {
      throw new NotFoundException('维修项不存在');
    }

    // ✅ 如果更新价格，验证价格
    if (updateData.price !== undefined && parseFloat(updateData.price as any) <= 0) {
      throw new BadRequestException('项目费用必须大于0');
    }

    await this.workItemRepository.update(id, updateData);
    return this.workItemRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const workItem = await this.workItemRepository.findOne({ where: { id } });
    if (!workItem) {
      throw new NotFoundException('维修项不存在');
    }
    await this.workItemRepository.remove(workItem);
    return { message: '删除成功', id };
  }
}
