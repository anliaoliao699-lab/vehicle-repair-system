import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
export declare class NotificationsService {
    private notificationRepository;
    constructor(notificationRepository: Repository<Notification>);
    create(createDto: any): Promise<Notification[]>;
    findByUser(userId: number, isRead?: boolean): Promise<Notification[]>;
    markAsRead(id: number): Promise<{
        message: string;
    }>;
    markAllAsRead(userId: number): Promise<{
        message: string;
    }>;
}
