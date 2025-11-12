// src/work-items/work-items.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkItemsService } from './work-items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('维修项管理')
@Controller('work-items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkItemsController {
  constructor(private workItemsService: WorkItemsService) {}

  @Post('work-orders/:workOrderId/items')
  @ApiOperation({ summary: '添加维修项' })
  create(@Param('workOrderId') workOrderId: string, @Body() createDto: any) {
    return this.workItemsService.create(+workOrderId, createDto);
  }

  @Get('work-orders/:workOrderId/items')
  @ApiOperation({ summary: '获取工单的维修项列表' })
  findByWorkOrder(@Param('workOrderId') workOrderId: string) {
    return this.workItemsService.findByWorkOrder(+workOrderId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新维修项' })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.workItemsService.update(+id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除维修项' })
  remove(@Param('id') id: string) {
    return this.workItemsService.remove(+id);
  }
}