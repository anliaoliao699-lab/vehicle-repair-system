import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findByUser(req: any, isRead?: string): Promise<import("../entities/notification.entity").Notification[]>;
    markAsRead(id: string): Promise<{
        message: string;
    }>;
    markAllAsRead(req: any): Promise<{
        message: string;
    }>;
}
