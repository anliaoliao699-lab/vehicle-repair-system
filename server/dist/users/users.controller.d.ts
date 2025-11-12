import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(role?: string): Promise<import("../entities/user.entity").User[]>;
    getAvailableWorkers(shopId?: string): Promise<import("../entities/user.entity").User[]>;
    findOne(id: string): Promise<import("../entities/user.entity").User>;
    update(id: string, updateData: any): Promise<import("../entities/user.entity").User>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
