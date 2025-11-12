export declare enum UserRole {
    OWNER = "owner",
    WORKER = "worker",
    ADMIN = "admin"
}
export declare class User {
    id: number;
    name: string;
    phone: string;
    password: string;
    role: UserRole;
    avatar: string;
    wechatOpenId: string;
    wechatUnionId: string;
    wechatSessionKey: string;
    isActive: boolean;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}
