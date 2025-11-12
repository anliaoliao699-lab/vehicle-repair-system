import { User } from './user.entity';
export declare class Log {
    id: number;
    action: string;
    description: string;
    userId: number;
    user: User;
    ip: string;
    createdAt: Date;
}
