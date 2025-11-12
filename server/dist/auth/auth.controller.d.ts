import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    refresh(req: any): Promise<{
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
    getProfile(req: any): any;
}
