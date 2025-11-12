import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createDto: any): Promise<import("../entities/payment.entity").Payment[]>;
    findByWorkOrder(workOrderId: string): Promise<import("../entities/payment.entity").Payment[]>;
    confirm(id: string, transactionId?: string): Promise<import("../entities/payment.entity").Payment>;
    refund(id: string): Promise<import("../entities/payment.entity").Payment>;
    notify(notifyData: any): {
        success: boolean;
    };
}
