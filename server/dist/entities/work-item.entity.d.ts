import { WorkOrder } from './work-order.entity';
export declare enum WorkItemStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed"
}
export declare class WorkItem {
    id: number;
    orderId: number;
    workOrder: WorkOrder;
    name: string;
    description: string;
    price: number;
    status: WorkItemStatus;
    createdAt: Date;
    updatedAt: Date;
}
