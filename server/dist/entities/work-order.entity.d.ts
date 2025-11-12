import { Vehicle } from './vehicle.entity';
import { User } from './user.entity';
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
export declare class WorkOrder {
    id: number;
    orderNo: string;
    customerId: number;
    staffId: number;
    vehicleInfo: string;
    description: string;
    status: WorkOrderStatus;
    workerRoles: {
        [key: number]: string;
    };
    assignedWorkerId: number;
    estimatedCost: number;
    actualCost: number;
    estimatedCompletionTime: Date;
    actualCompletionTime: Date;
    priority: number;
    createdBy: number;
    vehicleId: number;
    vehicle: Vehicle;
    staff: User;
    workers: User[];
    createdAt: Date;
    updatedAt: Date;
}
