import { User } from './user.entity';
export declare enum NotificationType {
    WORK_ORDER_CREATED = "work_order_created",
    WORK_ORDER_ASSIGNED = "work_order_assigned",
    WORK_ORDER_COMPLETED = "work_order_completed",
    PAYMENT_REMINDER = "payment_reminder",
    PAYMENT_RECEIVED = "payment_received"
}
export declare class Notification {
    id: number;
    userId: number;
    user: User;
    type: NotificationType;
    title: string;
    content: string;
    isRead: boolean;
    data: any;
    createdAt: Date;
}
