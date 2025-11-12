import { WorkItemsService } from './work-items.service';
export declare class WorkItemsController {
    private workItemsService;
    constructor(workItemsService: WorkItemsService);
    create(workOrderId: string, createDto: any): Promise<import("../entities/work-item.entity").WorkItem>;
    findByWorkOrder(workOrderId: string): Promise<import("../entities/work-item.entity").WorkItem[]>;
    update(id: string, updateData: any): Promise<import("../entities/work-item.entity").WorkItem>;
    remove(id: string): Promise<{
        message: string;
        id: number;
    }>;
}
