// src/types/index.ts

// 工单状态枚举
export enum WorkOrderStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ACCEPTED = 'accepted',
  PAID = 'paid',
  CLOSED = 'closed',
}

// 用户角色枚举
export enum UserRole {
  CUSTOMER = 'customer',
  STAFF = 'staff',
  ADMIN = 'admin',
}

// 支付方式枚举
export enum PaymentMethod {
  CASH = 'cash',
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  CARD = 'card',
}

// 车辆信息
export interface Vehicle {
  id: number;
  plateNumber: string;
  brand?: string;
  model?: string;
  year?: number;
  vinNumber?: string;
  customerId: number;
  createdAt: string;
  updatedAt: string;
}

// 工单信息
export interface WorkOrder {
  id: number;
  orderNo: string;
  customerId: number;
  staffId?: number;
  vehicleId: number;
  vehicleInfo: string;
  description?: string;
  status: WorkOrderStatus;
  priority?: number;
  estimatedCost?: number;
  actualCost?: number;
  estimatedCompletionTime?: string;
  actualCompletionTime?: string;
  workerRoles?: Record<number, string>;
  workers?: WorkerAssignment[];
  vehicle?: Vehicle;
  createdAt: string;
  updatedAt: string;
}

// 工单分配的员工
export interface WorkerAssignment {
  workerId: number;
  role: string;
  assignedAt?: string;
}

// 工单项目
export interface WorkItem {
  id: number;
  orderId: number;
  itemName: string;
  description?: string;
  price: number;
  status?: string;
  createdAt: string;
}

// 配件/材料
export interface Material {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  createdAt: string;
}

// 支付记录
export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'success' | 'failed';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// 通知
export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  status: 'unread' | 'read';
  relatedType?: string;
  relatedId?: number;
  createdAt: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}
