// src/payments/payments.controller.ts
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('支付管理')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: '创建支付' })
  create(@Body() createDto: any) {
    return this.paymentsService.create(createDto);
  }

  @Get('work-orders/:workOrderId')
  @ApiOperation({ summary: '获取工单的支付记录' })
  findByWorkOrder(@Param('workOrderId') workOrderId: string) {
    return this.paymentsService.findByWorkOrder(+workOrderId);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: '确认支付' })
  confirm(@Param('id') id: string, @Body('transactionId') transactionId?: string) {
    return this.paymentsService.confirmPayment(+id, transactionId);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: '退款' })
  refund(@Param('id') id: string) {
    return this.paymentsService.refund(+id);
  }

  @Post('notify')
  @ApiOperation({ summary: '支付回调' })
  notify(@Body() notifyData: any) {
    // 处理第三方支付回调
    return { success: true };
  }
}