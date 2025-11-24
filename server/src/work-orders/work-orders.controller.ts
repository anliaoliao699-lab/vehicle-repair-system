// src/work-orders/work-orders.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { OssService } from '../oss/oss.service';

@ApiTags('工单管理')
@Controller('work-orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkOrdersController {
  constructor(
    private workOrdersService: WorkOrdersService,
    private ossService: OssService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建工单' })
  create(@Body() createDto: CreateWorkOrderDto, @Request() req) {
    return this.workOrdersService.create(createDto, req.user.id);
  }

  @Post('upload')
  @ApiOperation({ summary: '上传工单图片到阿里云' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    const url = await this.ossService.uploadFile(file);
    return { success: true, url };
  }

  /**
   * 获取工单列表
   * ✅ 注意：@Get() 只需要一个装饰器
   */
  @Get()
  @ApiOperation({ summary: '获取工单列表' })
  findAll(@Query() filters: any, @Request() req) {
    console.log('🔥 JWT 原始内容', req.user);
    const role = req.user.role;
    const userId = req.user.id;   // ✅ 必须这样取
    console.log('🔥 控制器入口', { role, userId, filters });
    return this.workOrdersService.findAll(filters, role, userId);
  }

  // ==================== 派工相关接口 ====================
  // 注意：这些接口必须放在 @Get(':id') 之前！

  /**
   * 获取工单已分配的员工列表
   */
  @ApiOperation({ summary: '获取工单已分配的员工' })
  @Get(':id/workers')
  async getWorkOrderWorkers(@Param('id') id: string) {
    try {
      const orderId = parseInt(id);
      if (isNaN(orderId)) {
        throw new BadRequestException('Invalid work order ID');
      }
      return this.workOrdersService.getAssignedWorkers(orderId);
    } catch (error) {
      console.error('获取工单员工失败:', error);
      throw error;
    }
  }

  /**
   * 为工单分配员工
   */
  @ApiOperation({ summary: '为工单分配员工' })
  @Post(':id/workers')
  async assignWorkersToOrder(
    @Param('id') id: string,
    @Body() assignData: { workerIds: number[]; roles?: { [key: number]: string } }
  ) {
    try {
      const orderId = parseInt(id);
      if (isNaN(orderId)) {
        throw new BadRequestException('Invalid work order ID');
      }
      
      if (!assignData.workerIds || !Array.isArray(assignData.workerIds)) {
        throw new BadRequestException('workerIds must be an array');
      }

      return this.workOrdersService.assignWorkers(
        orderId,
        assignData.workerIds,
        assignData.roles || {}
      );
    } catch (error) {
      console.error('分配员工失败:', error);
      throw error;
    }
  }

  /**
   * 移除工单的员工分配
   */
  @ApiOperation({ summary: '移除工单员工分配' })
  @Delete(':id/workers/:workerId')
  async removeWorkerFromOrder(
    @Param('id') id: string,
    @Param('workerId') workerId: string
  ) {
    try {
      const orderId = parseInt(id);
      const workerIdNum = parseInt(workerId);
      
      if (isNaN(orderId) || isNaN(workerIdNum)) {
        throw new BadRequestException('Invalid ID');
      }

      return this.workOrdersService.removeWorker(orderId, workerIdNum);
    } catch (error) {
      console.error('移除员工失败:', error);
      throw error;
    }
  }

  /**
   * 获取工单的图片列表
   */
  @ApiOperation({ summary: '获取工单图片列表' })
  @Get(':id/images')
  async getWorkOrderImages(@Param('id') id: string) {
    return this.workOrdersService.getOrderImages(+id);
  }

  // ==================== 原有的接口 ====================

  /**
   * 获取工单详情
   * ✅ 这个必须放在最后，因为 :id 是通用的，会匹配所有上面没有匹配的路由
   */
  @Get(':id')
  @ApiOperation({ summary: '获取工单详情' })
  findOne(@Param('id') id: string) {
    return this.workOrdersService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新工单' })
  update(@Param('id') id: string, @Body() updateData: any, @Request() req) {
    return this.workOrdersService.update(+id, updateData, req.user.id);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: '分配工单给员工' })
  assign(@Param('id') id: string, @Body() assignDto: AssignWorkOrderDto, @Request() req) {
    return this.workOrdersService.assign(+id, assignDto.workers, req.user.id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: '员工开始工单' })
  start(@Param('id') id: string, @Request() req) {
    return this.workOrdersService.start(+id, req.user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '员工完成工单' })
  complete(@Param('id') id: string, @Request() req) {
    return this.workOrdersService.complete(+id, req.user.id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: '车主验收工单' })
  accept(@Param('id') id: string, @Request() req) {
    return this.workOrdersService.accept(+id, req.user.id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: '关闭工单' })
  close(@Param('id') id: string, @Request() req) {
    return this.workOrdersService.close(+id, req.user.id);
  }
}