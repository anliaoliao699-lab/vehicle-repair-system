import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder, WorkOrderStatus } from '../entities/work-order.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(WorkOrder)
    private workOrderRepository: Repository<WorkOrder>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getDailyReport(date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const workOrders = await this.workOrderRepository.createQueryBuilder('wo')
      .where('wo.createdAt >= :startDate AND wo.createdAt <= :endDate', { startDate, endDate })
      .getMany();

    const payments = await this.paymentRepository.createQueryBuilder('p')
      .where('p.paidAt >= :startDate AND p.paidAt <= :endDate', { startDate, endDate })
      .andWhere('p.status = :status', { status: PaymentStatus.PAID })
      .getMany();

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      date,
      totalWorkOrders: workOrders.length,
      completedWorkOrders: workOrders.filter(wo => wo.status === WorkOrderStatus.COMPLETED).length,
      totalRevenue,
      totalPayments: payments.length,
    };
  }

  async getWorkerPerformance(workerId: number, startDate?: string, endDate?: string) {
    const queryBuilder = this.workOrderRepository.createQueryBuilder('wo')
      .where('wo.assignedWorkerId = :workerId', { workerId });

    if (startDate) {
      queryBuilder.andWhere('wo.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('wo.createdAt <= :endDate', { endDate });
    }

    const workOrders = await queryBuilder.getMany();

    const completed = workOrders.filter(wo => wo.status === WorkOrderStatus.COMPLETED || wo.status === WorkOrderStatus.CLOSED);

    return {
      workerId,
      totalAssigned: workOrders.length,
      completed: completed.length,
      completionRate: workOrders.length > 0 ? (completed.length / workOrders.length * 100).toFixed(2) : 0,
      totalRevenue: workOrders.reduce((sum, wo) => sum + Number(wo.actualCost), 0),
    };
  }
}