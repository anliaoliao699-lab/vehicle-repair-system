import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkItemsService } from './work-items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('维修项管理')
@Controller('work-orders')  // ✅ 改这里：从 work-items 改为 work-orders
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkItemsController {
  constructor(private workItemsService: WorkItemsService) {}

  // ==================== 维修项相关接口 ====================

  /**
   * 添加维修项
   * ✅ 路由：POST /work-orders/{workOrderId}/items
   */
  @Post(':workOrderId/items')
  @ApiOperation({ summary: '添加维修项' })
  async create(
    @Param('workOrderId') workOrderId: string, 
    @Body() createDto: any
  ) {
    const orderId = parseInt(workOrderId);
    
    // 验证 ID 有效性
    if (isNaN(orderId)) {
      throw new BadRequestException('Invalid work order ID');
    }

    // 验证必填字段
    if (!createDto.item_name) {
      throw new BadRequestException('缺少必填字段: item_name');
    }

    if (createDto.price === undefined || createDto.price === null) {
      throw new BadRequestException('缺少必填字段: price');
    }

    console.log('📥 接收维修项数据:', { orderId, createDto });

    return this.workItemsService.create(orderId, createDto);
  }

  /**
   * 获取工单的维修项列表
   * ✅ 路由：GET /work-orders/{workOrderId}/items
   */
  @Get(':workOrderId/items')
  @ApiOperation({ summary: '获取工单的维修项列表' })
  async findByWorkOrder(@Param('workOrderId') workOrderId: string) {
    const orderId = parseInt(workOrderId);
    
    if (isNaN(orderId)) {
      throw new BadRequestException('Invalid work order ID');
    }

    console.log('📥 查询工单维修项:', orderId);

    return this.workItemsService.findByWorkOrder(orderId);
  }

  /**
   * 更新维修项
   * ✅ 路由：PUT /work-orders/items/{id}
   */
  @Put('items/:id')
  @ApiOperation({ summary: '更新维修项' })
  async update(
    @Param('id') id: string, 
    @Body() updateData: any
  ) {
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      throw new BadRequestException('Invalid item ID');
    }

    // 如果更新价格，验证价格
    if (updateData.price !== undefined && parseFloat(updateData.price) <= 0) {
      throw new BadRequestException('项目费用必须大于0');
    }

    console.log('📥 更新维修项:', { itemId, updateData });

    return this.workItemsService.update(itemId, updateData);
  }

  /**
   * 删除维修项
   * ✅ 路由：DELETE /work-orders/items/{id}
   */
  @Delete('items/:id')
  @ApiOperation({ summary: '删除维修项' })
  async remove(@Param('id') id: string) {
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      throw new BadRequestException('Invalid item ID');
    }

    console.log('📥 删除维修项:', itemId);

    return this.workItemsService.remove(itemId);
  }

  /**
   * 获取工单的工作项（分页支持）
   * ✅ 新增接口，支持分页
   */
  @Get(':workOrderId/work-items')
  @ApiOperation({ summary: '获取工单的工作项（分页）' })
  async findByOrderIdWithPagination(
    @Param('workOrderId') workOrderId: string
  ) {
    const orderId = parseInt(workOrderId);
    
    if (isNaN(orderId)) {
      throw new BadRequestException('Invalid work order ID');
    }

    return this.workItemsService.findByOrderId(orderId);
  }

  /**
   * 计算工单的总费用
   * ✅ 新增接口
   */
  @Get(':workOrderId/total-cost')
  @ApiOperation({ summary: '获取工单的总费用' })
  async getTotalCost(@Param('workOrderId') workOrderId: string) {
    const orderId = parseInt(workOrderId);
    
    if (isNaN(orderId)) {
      throw new BadRequestException('Invalid work order ID');
    }

    const total = await this.workItemsService.getTotalCostByOrderId(orderId);
    return { orderId, totalCost: total };
  }
}