import { User } from './user.entity';
export declare class Vehicle {
    id: number;
    plateNumber: string;
    brand: string;
    model: string;
    color: string;
    vinNumber: string;
    customerId: number;
    customer: User;
    createdAt: Date;
    updatedAt: Date;
}
