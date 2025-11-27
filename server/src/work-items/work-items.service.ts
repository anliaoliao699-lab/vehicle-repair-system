// src/work-items/work-items.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkItem } from '../entities/work-item.entity';
import { WorkOrder } from '../entities/work-order.entity';

@Injectable()
export class WorkItemsService {
  constructor(
    @InjectRepository(WorkItem)
    private workItemRepository: Repository<WorkItem>,
    @InjectRepository(WorkOrder)
    private workOrderRepository: Repository<WorkOrder>,
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

    const workItem = this.workItemRepository.create({
      orderId: workOrderId,
      name: createDto.item_name,
      description: createDto.description,
      price: parseFloat(createDto.price),
      status: createDto.status || 'pending'
    });
    
    const saved = await this.workItemRepository.save(workItem);
    
    // ✅ 添加维修项后自动更新工单费用
    await this.updateWorkOrderCost(workOrderId);
    
    return saved;
  }

  async findByWorkOrder(workOrderId: number) {
    return this.workItemRepository.find({
      where: { orderId: workOrderId },
      order: { createdAt: 'DESC' },
    });
  }

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

  async getTotalCostByOrderId(orderId: number): Promise<number> {
    const result = await this.workItemRepository
      .createQueryBuilder('work_item')
      .select('SUM(work_item.price)', 'total')
      .where('work_item.orderId = :orderId', { orderId })
      .getRawOne();

    return parseFloat(result?.total) || 0;
  }

  async update(id: number, updateData: Partial<WorkItem>) {
    const workItem = await this.workItemRepository.findOne({ where: { id } });
    if (!workItem) {
      throw new NotFoundException('维修项不存在');
    }

    if (updateData.price !== undefined && parseFloat(updateData.price as any) <= 0) {
      throw new BadRequestException('项目费用必须大于0');
    }

    await this.workItemRepository.update(id, updateData);
    
    // ✅ 更新维修项后自动更新工单费用
    await this.updateWorkOrderCost(workItem.orderId);
    
    return this.workItemRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const workItem = await this.workItemRepository.findOne({ where: { id } });
    if (!workItem) {
      throw new NotFoundException('维修项不存在');
    }
    
    const orderId = workItem.orderId;
    
    await this.workItemRepository.remove(workItem);
    
    // ✅ 删除维修项后自动更新工单费用
    await this.updateWorkOrderCost(orderId);
    
    return { message: '删除成功', id };
  }

  /**
   * ✅ 新增：自动更新工单的费用
   */
  private async updateWorkOrderCost(orderId: number) {
    try {
      const totalCost = await this.getTotalCostByOrderId(orderId);
      
      // 更新工单的 actual_cost 字段
      await this.workOrderRepository.update(orderId, {
        actualCost: totalCost,
      });
      
      console.log(`✅ 工单 ${orderId} 费用已更新为: ${totalCost}`);
    } catch (error) {
      console.error(`❌ 更新工单 ${orderId} 费用失败:`, error);
    }
  }
}