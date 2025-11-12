import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            name: string;
            phone: string;
            role: import("../entities/user.entity").UserRole;
            avatar: string;
            isActive: boolean;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            name: string;
            phone: string;
            role: import("../entities/user.entity").UserRole;
            avatar: string;
            isActive: boolean;
        };
    }>;
    private generateTokens;
    validateUser(userId: number): Promise<User | null>;
    refreshToken(userId: number): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            name: string;
            phone: string;
            role: import("../entities/user.entity").UserRole;
            avatar: string;
            isActive: boolean;
        };
    }>;
    findUserById(id: number): Promise<User | null>;
}
