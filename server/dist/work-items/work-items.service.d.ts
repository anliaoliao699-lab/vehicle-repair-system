import { Repository } from 'typeorm';
import { WorkItem } from '../entities/work-item.entity';
export declare class WorkItemsService {
    private workItemRepository;
    constructor(workItemRepository: Repository<WorkItem>);
    create(workOrderId: number, createDto: any): Promise<WorkItem>;
    findByWorkOrder(workOrderId: number): Promise<WorkItem[]>;
    findByOrderId(orderId: number, page?: number, limit?: number): Promise<{
        items: WorkItem[];
        total: number;
    }>;
    getTotalCostByOrderId(orderId: number): Promise<any>;
    update(id: number, updateData: Partial<WorkItem>): Promise<WorkItem>;
    remove(id: number): Promise<{
        message: string;
        id: number;
    }>;
}
