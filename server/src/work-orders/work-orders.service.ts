import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder, WorkOrderStatus } from '../entities/work-order.entity';
import { User } from '../entities/user.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { LogsService } from '../logs/logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Photo } from '../entities/photo.entity';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder)
    private workOrderRepository: Repository<WorkOrder>,
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private logsService: LogsService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createDto: CreateWorkOrderDto, userId: number) {
    const orderNo = this.generateOrderNo();
    
    let customerId = null;

    const workOrder = this.workOrderRepository.create({
      orderNo,
      customerId: null,
      vehicleId: null,
      vehicleInfo: createDto.vehicle_info || 'N/A',
      description: createDto.description || null,
      estimatedCost: createDto.estimatedCost || 0,
      estimatedCompletionTime: createDto.estimatedCompletionTime ? new Date(createDto.estimatedCompletionTime) : null,
      priority: createDto.priority || 1,
      createdBy: userId,
      status: WorkOrderStatus.NEW,
    });

    try {
      const savedWorkOrder = await this.workOrderRepository.save(workOrder);

      await this.logsService.create({
        action: 'create_work_order',
        details: `创建工单 ${orderNo}`,
        userId,
      });

      return savedWorkOrder;
    } catch (error) {
      console.error('Error saving work order:', error);
      throw error;
    }
  }

  private generateOrderNo(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `WO${timestamp}${random}`;
  }

  async findAll(filters: any, role: string, userId: number) {
    console.log('🔥 后端入口 filters', filters);
  console.log('🔥 后端入口 role/userId', { role, userId });
    
    let sql = `SELECT DISTINCT wo.* FROM work_orders wo`;
    const params: any[] = [];

    if (role === 'worker') {
      // ✅ 修复：员工能看到分配给他的工单
      sql += ` LEFT JOIN work_order_workers wow ON wow.work_order_id = wo.id AND wow.worker_id = ?`;
      params.push(userId);
      
      // 条件：派工表中有该员工的记录
      sql += ` WHERE wow.worker_id = ?`;
      params.push(userId);
      
      console.log(`🔍 员工 ${userId} 查询工单`);
    } else if (role === 'customer') {
      sql += ` WHERE wo.customer_id = ?`;
      params.push(userId);
    }

    if (filters.status && filters.status !== 'all') {
      sql += params.length ? ' AND' : ' WHERE';
      sql += ' wo.status = ?';
      params.push(filters.status);
    }

    // 分页
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const offset = (page - 1) * limit;
    sql += ` ORDER BY wo.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    console.log('📊 查询SQL:', sql);
    console.log('📊 查询参数:', params);

    try {
      const items = await this.workOrderRepository.query(sql, params);
      console.log(`✅ 查询成功，获得 ${items.length} 个工单`);

      // 总数统计
      let countSql = `SELECT COUNT(DISTINCT wo.id) as total FROM work_orders wo`;
      const countParams: any[] = [];
      
      if (role === 'worker') {
        countSql += ` LEFT JOIN work_order_workers wow ON wow.work_order_id = wo.id`;
        countSql += ` WHERE wow.worker_id = ?`;
        countParams.push(userId);
      } else if (role === 'customer') {
        countSql += ` WHERE wo.customer_id = ?`;
        countParams.push(userId);
      }
      
      if (filters.status && filters.status !== 'all') {
        countSql += countParams.length ? ' AND' : ' WHERE';
        countSql += ' wo.status = ?';
        countParams.push(filters.status);
      }
      
      const totalResult = await this.workOrderRepository.query(countSql, countParams);
      const total = totalResult[0]?.total || 0;

      return { items, total };
    } catch (error) {
      console.error('❌ 查询工单失败:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id },
      relations: ['vehicle', 'workers'],
    });

    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    return workOrder;
  }

  async update(id: number, updateData: any, userId: number) {
    const workOrder = await this.findOne(id);

    const fieldMapping: Record<string, string> = {
      'vehicle_info': 'vehicleInfo',
      'vehicleInfo': 'vehicleInfo',
      'description': 'description',
      'estimated_cost': 'estimatedCost',
      'estimatedCost': 'estimatedCost',
      'actual_cost': 'actualCost',
      'actualCost': 'actualCost',
      'priority': 'priority',
    };

    const dataToUpdate: any = {};

    for (const [key, value] of Object.entries(updateData)) {
      const mappedKey = fieldMapping[key];

      if (!mappedKey || value === undefined || value === null) {
        continue;
      }

      try {
        if (mappedKey.includes('Cost')) {
          let numValue: number;

          if (typeof value === 'string') {
            numValue = parseFloat(value);
          } else if (typeof value === 'number') {
            numValue = value;
          } else {
            numValue = 0;
          }

          dataToUpdate[mappedKey] = isNaN(numValue) ? 0 : numValue;

        } else if (mappedKey === 'priority') {
          let numValue: number;

          if (typeof value === 'string') {
            numValue = parseInt(value, 10);
          } else if (typeof value === 'number') {
            numValue = value;
          } else {
            numValue = 1;
          }

          dataToUpdate[mappedKey] = isNaN(numValue) ? 1 : numValue;

        } else {
          dataToUpdate[mappedKey] = String(value).trim();
        }
      } catch (e) {
        console.warn(`转换失败 [${key}]:`, e);
        continue;
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw new BadRequestException('没有有效的更新字段');
    }

    try {
      await this.workOrderRepository.update(id, dataToUpdate);

      await this.logsService.create({
        action: 'update_work_order',
        details: `更新工单 ${id}`,
        userId,
      });

      return this.findOne(id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      throw new BadRequestException(`更新工单失败: ${errorMsg}`);
    }
  }

  // ✅ 修复：派工时更新工单状态
  async assign(id: number, workerIds: { workerId: number; role: string }[], userId: number) {
    try {
      const order = await this.findOne(id);
      if (!order) throw new NotFoundException('工单不存在');

      console.log(`📋 开始派工：工单 ${id}，派给 ${workerIds.length} 个工人`);

      // 第1步：分配工作人员到派工表
      const assignResult = await this.assignWorkers(
        id,
        workerIds.map(w => w.workerId),
        Object.fromEntries(workerIds.map(w => [w.workerId, w.role]))
      );

      console.log(`✅ 派工表更新成功：${assignResult.message}`);

      // 第2步：✅ 更新工单状态为已分配
      const updateResult = await this.workOrderRepository.update(
        { id },
        { status: WorkOrderStatus.ASSIGNED }
      );

      console.log(`✅ 工单 ${id} 状态已更新为 ASSIGNED`);

      // 第3步：写入日志
      await this.logsService.create({
        action: 'assign_work_order',
        details: `分配工单 ${order.orderNo} 给工人 ${workerIds.map(w => w.workerId).join(', ')}`,
        userId,
      });

      console.log(`✅ 派工日志已记录`);

      // 第4步：发送通知
      for (const { workerId, role } of workerIds) {
        try {
          await this.notificationsService.create({
            userId: workerId,
            type: 'work_order_assigned' as any,
            title: '新工单分配',
            content: `您有新的工单 ${order.orderNo}，角色：${role}`,
            data: { workOrderId: id, role },
          });
          console.log(`✅ 已向员工 ${workerId} 发送通知`);
        } catch (notifError) {
          console.error(`⚠️ 发送通知失败给员工 ${workerId}:`, notifError);
          // 继续处理其他员工
        }
      }

      return { 
        message: '✅ 工单分配完成',
        workOrderId: id,
        status: WorkOrderStatus.ASSIGNED,
        workerCount: workerIds.length
      };
    } catch (error) {
      console.error('❌ 分配工单失败:', error);
      throw error;
    }
  }

  async start(id: number, userId: number) {
    const workOrder = await this.findOne(id);

    if (workOrder.assignedWorkerId !== userId) {
      throw new ForbiddenException('您无权操作此工单');
    }

    workOrder.status = WorkOrderStatus.IN_PROGRESS;
    await this.workOrderRepository.save(workOrder);

    await this.logsService.create({
      action: 'start_work_order',
      details: `开始维修工单 ${workOrder.orderNo}`,
      userId,
    });

    return workOrder;
  }

  async complete(id: number, userId: number) {
    const workOrder = await this.findOne(id);

    if (workOrder.assignedWorkerId !== userId) {
      throw new ForbiddenException('您无权操作此工单');
    }

    workOrder.status = WorkOrderStatus.COMPLETED;
    workOrder.actualCompletionTime = new Date();
    await this.workOrderRepository.save(workOrder);

    await this.logsService.create({
      action: 'complete_work_order',
      details: `完成工单 ${workOrder.orderNo}`,
      userId,
    });

    await this.notificationsService.create({
      userId: workOrder.vehicle.customerId,
      type: 'work_order_completed' as any,
      title: '工单已完成',
      content: `您的车辆 ${workOrder.vehicle.plateNumber} 维修已完成,请验收`,
      data: { workOrderId: id },
    });

    return workOrder;
  }

  async accept(id: number, userId: number) {
    const workOrder = await this.findOne(id);

    workOrder.status = WorkOrderStatus.ACCEPTED;
    await this.workOrderRepository.save(workOrder);

    await this.logsService.create({
      action: 'accept_work_order',
      details: `车主验收工单 ${workOrder.orderNo}`,
      userId,
    });

    return workOrder;
  }

  async close(id: number, userId: number) {
    const workOrder = await this.findOne(id);

    workOrder.status = WorkOrderStatus.CLOSED;
    await this.workOrderRepository.save(workOrder);

    await this.logsService.create({
      action: 'close_work_order',
      details: `关闭工单 ${workOrder.orderNo}`,
      userId,
    });

    return workOrder;
  }

  // ==================== 派工相关方法 ====================

  /**
   * 获取工单已分配的员工列表
   */
  async getAssignedWorkers(orderId: number) {
    try {
      const query = `
        SELECT 
          u.id,
          u.name,
          u.role,
          u.phone,
          wow.worker_role,
          wow.assigned_at
        FROM work_order_workers wow
        INNER JOIN users u ON wow.worker_id = u.id
        WHERE wow.work_order_id = ?
          AND u.is_active = true
        ORDER BY wow.assigned_at DESC
      `;
      
      const workers = await this.workOrderRepository.query(query, [orderId]);
      
      console.log(`✅ 工单 ${orderId} 已分配 ${workers.length} 个员工`);
      
      return workers.map(w => ({
        id: w.id,
        username: w.name,
        role: w.role,
        phone: w.phone || '',
        workerRole: w.worker_role || '',
        assignedAt: w.assigned_at
      }));
    } catch (error) {
      console.error('❌ 获取已分配员工失败:', error);
      return [];
    }
  }

  /**
   * 为工单分配员工
   */
  async assignWorkers(
    orderId: number,
    workerIds: number[],
    roles: { [key: number]: string }
  ) {
    try {
      // 1. 验证工单是否存在
      const workOrder = await this.findOne(orderId);
      if (!workOrder) {
        throw new NotFoundException('工单不存在');
      }

      // 2. 删除现有分配
      await this.workOrderRepository.query(
        'DELETE FROM work_order_workers WHERE work_order_id = ?',
        [orderId]
      );

      console.log(`✅ 已清除工单 ${orderId} 的现有分配`);

      // 3. 添加新的分配
      const insertPromises = workerIds.map(workerId => {
        const workerRole = roles[workerId] || '';
        return this.workOrderRepository.query(
          `INSERT INTO work_order_workers 
           (work_order_id, worker_id, worker_role, assigned_at) 
           VALUES (?, ?, ?, NOW())`,
          [orderId, workerId, workerRole]
        );
      });

      await Promise.all(insertPromises);
      await this.workOrderRepository.update(
        { id: orderId },
        {
          status: WorkOrderStatus.ASSIGNED,
          assignedWorkerId: workerIds[0],
        },
      );
      console.log(`✅ 成功为工单 ${orderId} 分配 ${workerIds.length} 个员工`);

      return {
        message: '分配成功',
        assignedCount: workerIds.length,
        workers: workerIds
      };
    } catch (error) {
      console.error('❌ 分配员工失败:', error);
      throw error;
    }
  }

  /**
   * 移除工单的员工分配
   */
  async removeWorker(orderId: number, workerId: number) {
    try {
      await this.workOrderRepository.query(
        'DELETE FROM work_order_workers WHERE work_order_id = ? AND worker_id = ?',
        [orderId, workerId]
      );

      console.log(`✅ 已从工单 ${orderId} 移除员工 ${workerId}`);

      return { 
        message: '移除成功',
        orderId,
        workerId
      };
    } catch (error) {
      console.error('❌ 移除员工失败:', error);
      throw error;
    }
  }

  async getOrderImages(workOrderId: number) {
    const photos = await this.photoRepository.find({
      where: { workOrderId },
      order: { createdAt: 'ASC' }
    });
    
    return photos.map(photo => ({
      id: photo.id,
      type: photo.type,
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl,
      uploadedBy: photo.uploadedBy,
      createdAt: photo.createdAt
    }));
  }
}