import { Repository } from 'typeorm';
import { WorkOrder, WorkOrderStatus } from '../entities/work-order.entity';
import { User } from '../entities/user.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { LogsService } from '../logs/logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Photo } from '../entities/photo.entity';
export declare class WorkOrdersService {
    private workOrderRepository;
    private photoRepository;
    private vehicleRepository;
    private userRepository;
    private logsService;
    private notificationsService;
    constructor(workOrderRepository: Repository<WorkOrder>, photoRepository: Repository<Photo>, vehicleRepository: Repository<Vehicle>, userRepository: Repository<User>, logsService: LogsService, notificationsService: NotificationsService);
    create(createDto: CreateWorkOrderDto, userId: number): Promise<WorkOrder>;
    private generateOrderNo;
    findAll(filters: any, role: string, userId: number): Promise<{
        items: any;
        total: any;
    }>;
    findOne(id: number): Promise<WorkOrder>;
    update(id: number, updateData: any, userId: number): Promise<WorkOrder>;
    assign(id: number, workerIds: {
        workerId: number;
        role: string;
    }[], userId: number): Promise<{
        message: string;
        workOrderId: number;
        status: WorkOrderStatus;
        workerCount: number;
    }>;
    start(id: number, userId: number): Promise<WorkOrder>;
    complete(id: number, userId: number): Promise<WorkOrder>;
    accept(id: number, userId: number): Promise<WorkOrder>;
    close(id: number, userId: number): Promise<WorkOrder>;
    checkWorkerAssigned(orderId: number, userId: number): Promise<boolean>;
    getAssignedWorkers(orderId: number): Promise<any>;
    assignWorkers(orderId: number, workerIds: number[], roles: {
        [key: number]: string;
    }): Promise<{
        message: string;
        assignedCount: number;
        workers: number[];
    }>;
    removeWorker(orderId: number, workerId: number): Promise<{
        message: string;
        orderId: number;
        workerId: number;
    }>;
    getOrderImages(workOrderId: number): Promise<{
        id: number;
        type: import("../entities/photo.entity").PhotoType;
        url: string;
        thumbnailUrl: string;
        uploadedBy: number;
        createdAt: Date;
    }[]>;
}
