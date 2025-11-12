export interface User {
    id: number;
    name: string;
    phone: string;
    role: 'customer' | 'staff' | 'admin';
    avatar?: string;
    createdAt?: string;
}
export interface LoginResponse {
    accessToken: string;
    user: User;
}
export interface RegisterRequest {
    name: string;
    phone: string;
    password: string;
    role?: 'customer' | 'staff' | 'admin';
}
/**
 * 手机号密码登录
 */
export declare function login(phone: string, password: string): Promise<LoginResponse>;
/**
 * 注册用户
 */
export declare function register(data: RegisterRequest): Promise<{
    user: User;
}>;
/**
 * 微信小程序登录
 */
export declare function wxLogin(code: string): Promise<LoginResponse>;
/**
 * 获取当前用户信息
 */
export declare function getCurrentUser(): Promise<User>;
/**
 * 本地保存登录状态
 */
export declare function saveLoginInfo(token: string, user: User): void;
/**
 * 清除登录状态
 */
export declare function clearLoginInfo(): void;
/**
 * 获取本地保存的用户信息
 */
export declare function getLocalUser(): User | null;
/**
 * 检查是否已登录
 */
export declare function isLoggedIn(): boolean;
//# sourceMappingURL=auth.d.ts.map