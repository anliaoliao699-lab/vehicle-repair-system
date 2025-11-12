import { Repository } from 'typeorm';
import { WorkOrder } from '../entities/work-order.entity';
import { Payment } from '../entities/payment.entity';
export declare class ReportsService {
    private workOrderRepository;
    private paymentRepository;
    constructor(workOrderRepository: Repository<WorkOrder>, paymentRepository: Repository<Payment>);
    getDailyReport(date: string): Promise<{
        date: string;
        totalWorkOrders: number;
        completedWorkOrders: number;
        totalRevenue: number;
        totalPayments: number;
    }>;
    getWorkerPerformance(workerId: number, startDate?: string, endDate?: string): Promise<{
        workerId: number;
        totalAssigned: number;
        completed: number;
        completionRate: string | number;
        totalRevenue: number;
    }>;
}
