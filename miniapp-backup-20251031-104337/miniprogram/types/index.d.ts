export declare enum WorkOrderStatus {
    NEW = "new",
    ASSIGNED = "assigned",
    IN_PROGRESS = "in_progress",
    ON_HOLD = "on_hold",
    COMPLETED = "completed",
    ACCEPTED = "accepted",
    PAID = "paid",
    CLOSED = "closed"
}
export declare enum UserRole {
    CUSTOMER = "customer",
    STAFF = "staff",
    ADMIN = "admin"
}
export declare enum PaymentMethod {
    CASH = "cash",
    WECHAT = "wechat",
    ALIPAY = "alipay",
    CARD = "card"
}
export interface Vehicle {
    id: number;
    plateNumber: string;
    brand?: string;
    model?: string;
    year?: number;
    vinNumber?: string;
    customerId: number;
    createdAt: string;
    updatedAt: string;
}
export interface WorkOrder {
    id: number;
    orderNo: string;
    customerId: number;
    staffId?: number;
    vehicleId: number;
    vehicleInfo: string;
    description?: string;
    status: WorkOrderStatus;
    priority?: number;
    estimatedCost?: number;
    actualCost?: number;
    estimatedCompletionTime?: string;
    actualCompletionTime?: string;
    workerRoles?: Record<number, string>;
    workers?: WorkerAssignment[];
    vehicle?: Vehicle;
    createdAt: string;
    updatedAt: string;
}
export interface WorkerAssignment {
    workerId: number;
    role: string;
    assignedAt?: string;
}
export interface WorkItem {
    id: number;
    orderId: number;
    itemName: string;
    description?: string;
    price: number;
    status?: string;
    createdAt: string;
}
export interface Material {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    createdAt: string;
}
export interface Payment {
    id: number;
    orderId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    status: 'pending' | 'success' | 'failed';
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Notification {
    id: number;
    userId: number;
    title: string;
    content: string;
    status: 'unread' | 'read';
    relatedType?: string;
    relatedId?: number;
    createdAt: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
}
//# sourceMappingURL=index.d.ts.map