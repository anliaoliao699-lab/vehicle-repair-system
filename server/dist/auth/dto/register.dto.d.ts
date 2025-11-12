import { UserRole } from '../../entities/user.entity';
export declare class RegisterDto {
    phone: string;
    password: string;
    name: string;
    role?: UserRole;
}
