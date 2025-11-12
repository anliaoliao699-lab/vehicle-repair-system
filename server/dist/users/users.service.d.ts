import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    findAll(role?: string): Promise<User[]>;
    findOne(id: number): Promise<User>;
    update(id: number, updateData: Partial<User>): Promise<User>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getAvailableWorkers(shopId?: number): Promise<User[]>;
}
