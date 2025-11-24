import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { OssService } from '../oss/oss.service';
export declare class WorkOrdersController {
    private workOrdersService;
    private ossService;
    constructor(workOrdersService: WorkOrdersService, ossService: OssService);
    create(createDto: CreateWorkOrderDto, req: any): Promise<import("../entities/work-order.entity").WorkOrder>;
    uploadFile(file: any): Promise<{
        success: boolean;
        url: string;
    }>;
    findAll(filters: any, req: any): Promise<{
        items: any;
        total: any;
    }>;
    getWorkOrderWorkers(id: string): Promise<any>;
    assignWorkersToOrder(id: string, assignData: {
        workerIds: number[];
        roles?: {
            [key: number]: string;
        };
    }): Promise<{
        message: string;
        assignedCount: number;
        workers: number[];
    }>;
    removeWorkerFromOrder(id: string, workerId: string): Promise<{
        message: string;
        orderId: number;
        workerId: number;
    }>;
    getWorkOrderImages(id: string): Promise<{
        id: number;
        type: import("../entities/photo.entity").PhotoType;
        url: string;
        thumbnailUrl: string;
        uploadedBy: number;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<import("../entities/work-order.entity").WorkOrder>;
    update(id: string, updateData: any, req: any): Promise<import("../entities/work-order.entity").WorkOrder>;
    assign(id: string, assignDto: AssignWorkOrderDto, req: any): Promise<{
        message: string;
        workOrderId: number;
        status: import("../entities/work-order.entity").WorkOrderStatus;
        workerCount: number;
    }>;
    start(id: string, req: any): Promise<import("../entities/work-order.entity").WorkOrder>;
    complete(id: string, req: any): Promise<import("../entities/work-order.entity").WorkOrder>;
    accept(id: string, req: any): Promise<import("../entities/work-order.entity").WorkOrder>;
    close(id: string, req: any): Promise<import("../entities/work-order.entity").WorkOrder>;
}
