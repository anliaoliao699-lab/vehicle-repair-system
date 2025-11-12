import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { WorkOrdersService } from '../work-orders/work-orders.service';
export declare class PaymentsService {
    private paymentRepository;
    private workOrdersService;
    constructor(paymentRepository: Repository<Payment>, workOrdersService: WorkOrdersService);
    create(createDto: any): Promise<Payment[]>;
    private generatePaymentNo;
    findByWorkOrder(workOrderId: number): Promise<Payment[]>;
    confirmPayment(id: number, transactionId?: string): Promise<Payment>;
    refund(id: number): Promise<Payment>;
}
