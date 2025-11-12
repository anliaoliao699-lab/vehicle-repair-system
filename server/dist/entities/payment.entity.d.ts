import { WorkOrder } from './work-order.entity';
export declare enum PaymentMethod {
    WECHAT = "wechat",
    ALIPAY = "alipay",
    CASH = "cash",
    BANK_TRANSFER = "bank_transfer"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare class Payment {
    id: number;
    paymentNo: string;
    workOrderId: number;
    workOrder: WorkOrder;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId: string;
    paidAt: Date;
    remark: string;
    createdAt: Date;
    updatedAt: Date;
}
