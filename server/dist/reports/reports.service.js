"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const work_order_entity_1 = require("../entities/work-order.entity");
const payment_entity_1 = require("../entities/payment.entity");
let ReportsService = class ReportsService {
    constructor(workOrderRepository, paymentRepository) {
        this.workOrderRepository = workOrderRepository;
        this.paymentRepository = paymentRepository;
    }
    async getDailyReport(date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        const workOrders = await this.workOrderRepository.createQueryBuilder('wo')
            .where('wo.createdAt >= :startDate AND wo.createdAt <= :endDate', { startDate, endDate })
            .getMany();
        const payments = await this.paymentRepository.createQueryBuilder('p')
            .where('p.paidAt >= :startDate AND p.paidAt <= :endDate', { startDate, endDate })
            .andWhere('p.status = :status', { status: payment_entity_1.PaymentStatus.PAID })
            .getMany();
        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        return {
            date,
            totalWorkOrders: workOrders.length,
            completedWorkOrders: workOrders.filter(wo => wo.status === work_order_entity_1.WorkOrderStatus.COMPLETED).length,
            totalRevenue,
            totalPayments: payments.length,
        };
    }
    async getWorkerPerformance(workerId, startDate, endDate) {
        const queryBuilder = this.workOrderRepository.createQueryBuilder('wo')
            .where('wo.assignedWorkerId = :workerId', { workerId });
        if (startDate) {
            queryBuilder.andWhere('wo.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('wo.createdAt <= :endDate', { endDate });
        }
        const workOrders = await queryBuilder.getMany();
        const completed = workOrders.filter(wo => wo.status === work_order_entity_1.WorkOrderStatus.COMPLETED || wo.status === work_order_entity_1.WorkOrderStatus.CLOSED);
        return {
            workerId,
            totalAssigned: workOrders.length,
            completed: completed.length,
            completionRate: workOrders.length > 0 ? (completed.length / workOrders.length * 100).toFixed(2) : 0,
            totalRevenue: workOrders.reduce((sum, wo) => sum + Number(wo.actualCost), 0),
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(work_order_entity_1.WorkOrder)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map