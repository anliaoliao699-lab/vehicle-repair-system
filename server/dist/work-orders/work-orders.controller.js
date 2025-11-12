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
exports.WorkOrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const work_orders_service_1 = require("./work-orders.service");
const create_work_order_dto_1 = require("./dto/create-work-order.dto");
const assign_work_order_dto_1 = require("./dto/assign-work-order.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const oss_service_1 = require("../oss/oss.service");
let WorkOrdersController = class WorkOrdersController {
    constructor(workOrdersService, ossService) {
        this.workOrdersService = workOrdersService;
        this.ossService = ossService;
    }
    create(createDto, req) {
        return this.workOrdersService.create(createDto, req.user.userId);
    }
    async uploadFile(file) {
        const url = await this.ossService.uploadFile(file);
        return { success: true, url };
    }
    findAll(filters, req) {
        console.log('🔥 JWT 原始内容', req.user);
        const role = req.user.role;
        const userId = req.user.id;
        console.log('🔥 控制器入口', { role, userId, filters });
        return this.workOrdersService.findAll(filters, role, userId);
    }
    async getWorkOrderWorkers(id) {
        try {
            const orderId = parseInt(id);
            if (isNaN(orderId)) {
                throw new common_1.BadRequestException('Invalid work order ID');
            }
            return this.workOrdersService.getAssignedWorkers(orderId);
        }
        catch (error) {
            console.error('获取工单员工失败:', error);
            throw error;
        }
    }
    async assignWorkersToOrder(id, assignData) {
        try {
            const orderId = parseInt(id);
            if (isNaN(orderId)) {
                throw new common_1.BadRequestException('Invalid work order ID');
            }
            if (!assignData.workerIds || !Array.isArray(assignData.workerIds)) {
                throw new common_1.BadRequestException('workerIds must be an array');
            }
            return this.workOrdersService.assignWorkers(orderId, assignData.workerIds, assignData.roles || {});
        }
        catch (error) {
            console.error('分配员工失败:', error);
            throw error;
        }
    }
    async removeWorkerFromOrder(id, workerId) {
        try {
            const orderId = parseInt(id);
            const workerIdNum = parseInt(workerId);
            if (isNaN(orderId) || isNaN(workerIdNum)) {
                throw new common_1.BadRequestException('Invalid ID');
            }
            return this.workOrdersService.removeWorker(orderId, workerIdNum);
        }
        catch (error) {
            console.error('移除员工失败:', error);
            throw error;
        }
    }
    findOne(id) {
        return this.workOrdersService.findOne(+id);
    }
    update(id, updateData, req) {
        return this.workOrdersService.update(+id, updateData, req.user.userId);
    }
    assign(id, assignDto, req) {
        return this.workOrdersService.assign(+id, assignDto.workers, req.user.userId);
    }
    start(id, req) {
        return this.workOrdersService.start(+id, req.user.userId);
    }
    complete(id, req) {
        return this.workOrdersService.complete(+id, req.user.userId);
    }
    accept(id, req) {
        return this.workOrdersService.accept(+id, req.user.userId);
    }
    close(id, req) {
        return this.workOrdersService.close(+id, req.user.userId);
    }
    async getWorkOrderImages(id) {
        return this.workOrdersService.getOrderImages(+id);
    }
};
exports.WorkOrdersController = WorkOrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建工单' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_work_order_dto_1.CreateWorkOrderDto, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: '上传工单图片到阿里云' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取工单列表' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取工单已分配的员工' }),
    (0, common_1.Get)(':id/workers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "getWorkOrderWorkers", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '为工单分配员工' }),
    (0, common_1.Post)(':id/workers'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "assignWorkersToOrder", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '移除工单员工分配' }),
    (0, common_1.Delete)(':id/workers/:workerId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "removeWorkerFromOrder", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取工单详情' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新工单' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, swagger_1.ApiOperation)({ summary: '分配工单给工人' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_work_order_dto_1.AssignWorkOrderDto, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, swagger_1.ApiOperation)({ summary: '工人开始工单' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: '工人完成工单' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    (0, swagger_1.ApiOperation)({ summary: '车主验收工单' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, swagger_1.ApiOperation)({ summary: '关闭工单' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "close", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取工单图片列表' }),
    (0, common_1.Get)(':id/images'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "getWorkOrderImages", null);
exports.WorkOrdersController = WorkOrdersController = __decorate([
    (0, swagger_1.ApiTags)('工单管理'),
    (0, common_1.Controller)('work-orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [work_orders_service_1.WorkOrdersService,
        oss_service_1.OssService])
], WorkOrdersController);
//# sourceMappingURL=work-orders.controller.js.map