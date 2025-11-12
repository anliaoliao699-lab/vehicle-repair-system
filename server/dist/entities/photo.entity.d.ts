import { WorkOrder } from './work-order.entity';
import { User } from './user.entity';
export declare enum PhotoType {
    BEFORE = "before",
    PROGRESS = "progress",
    AFTER = "after",
    MATERIAL = "material"
}
export declare class Photo {
    id: number;
    workOrderId: number;
    workOrder: WorkOrder;
    url: string;
    key: string;
    type: PhotoType;
    thumbnailUrl: string;
    uploadedBy: number;
    uploader: User;
    remark: string;
    createdAt: Date;
}
