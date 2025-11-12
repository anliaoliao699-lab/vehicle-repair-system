import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { WorkOrdersService } from '../work-orders/work-orders.service';
import { WorkOrderStatus } from '../entities/work-order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private workOrdersService: WorkOrdersService,
  ) {}

  async create(createDto: any) {
    const paymentNo = this.generatePaymentNo();
    
    const payment = this.paymentRepository.create({
      ...createDto,
      paymentNo,
    });

    return this.paymentRepository.save(payment);
  }

  private generatePaymentNo(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PAY${timestamp}${random}`;
  }

  async findByWorkOrder(workOrderId: number) {
    return this.paymentRepository.find({
      where: { workOrderId },
      order: { createdAt: 'DESC' },
    });
  }

  async confirmPayment(id: number, transactionId?: string) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    
    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();
    payment.transactionId = transactionId;

    await this.paymentRepository.save(payment);

    // 更新工单状态
    await this.workOrdersService.update(
      payment.workOrderId,
      { status: WorkOrderStatus.PAID },
      null,
    );

    return payment;
  }

  async refund(id: number) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    
    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    payment.status = PaymentStatus.REFUNDED;
    return this.paymentRepository.save(payment);
  }
}
