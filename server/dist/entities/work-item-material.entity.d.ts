import { WorkItem } from './work-item.entity';
import { Material } from './material.entity';
import { User } from './user.entity';
export declare enum MaterialRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class WorkItemMaterial {
    id: number;
    workItemId: number;
    workItem: WorkItem;
    materialId: number;
    material: Material;
    quantity: number;
    unitPrice: number;
    status: MaterialRequestStatus;
    requestedBy: number;
    requester: User;
    approvedBy: number;
    approver: User;
    createdAt: Date;
}
