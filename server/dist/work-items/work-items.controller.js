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
exports.WorkItemsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const work_items_service_1 = require("./work-items.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let WorkItemsController = class WorkItemsController {
    constructor(workItemsService) {
        this.workItemsService = workItemsService;
    }
    async create(workOrderId, createDto) {
        const orderId = parseInt(workOrderId);
        if (isNaN(orderId)) {
            throw new common_1.BadRequestException('Invalid work order ID');
        }
        if (!createDto.item_name) {
            throw new common_1.BadRequestException('缺少必填字段: item_name');
        }
        if (createDto.price === undefined || createDto.price === null) {
            throw new common_1.BadRequestException('缺少必填字段: price');
        }
        console.log('📥 接收维修项数据:', { orderId, createDto });
        return this.workItemsService.create(orderId, createDto);
    }
    async findByWorkOrder(workOrderId) {
        const orderId = parseInt(workOrderId);
        if (isNaN(orderId)) {
            throw new common_1.BadRequestException('Invalid work order ID');
        }
        console.log('📥 查询工单维修项:', orderId);
        return this.workItemsService.findByWorkOrder(orderId);
    }
    async update(id, updateData) {
        const itemId = parseInt(id);
        if (isNaN(itemId)) {
            throw new common_1.BadRequestException('Invalid item ID');
        }
        if (updateData.price !== undefined && parseFloat(updateData.price) <= 0) {
            throw new common_1.BadRequestException('项目费用必须大于0');
        }
        console.log('📥 更新维修项:', { itemId, updateData });
        return this.workItemsService.update(itemId, updateData);
    }
    async remove(id) {
        const itemId = parseInt(id);
        if (isNaN(itemId)) {
            throw new common_1.BadRequestException('Invalid item ID');
        }
        console.log('📥 删除维修项:', itemId);
        return this.workItemsService.remove(itemId);
    }
    async findByOrderIdWithPagination(workOrderId) {
        const orderId = parseInt(workOrderId);
        if (isNaN(orderId)) {
            throw new common_1.BadRequestException('Invalid work order ID');
        }
        return this.workItemsService.findByOrderId(orderId);
    }
    async getTotalCost(workOrderId) {
        const orderId = parseInt(workOrderId);
        if (isNaN(orderId)) {
            throw new common_1.BadRequestException('Invalid work order ID');
        }
        const total = await this.workItemsService.getTotalCostByOrderId(orderId);
        return { orderId, totalCost: total };
    }
};
exports.WorkItemsController = WorkItemsController;
__decorate([
    (0, common_1.Post)(':workOrderId/items'),
    (0, swagger_1.ApiOperation)({ summary: '添加维修项' }),
    __param(0, (0, common_1.Param)('workOrderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkItemsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':workOrderId/items'),
    (0, swagger_1.ApiOperation)({ summary: '获取工单的维修项列表' }),
    __param(0, (0, common_1.Param)('workOrderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkItemsController.prototype, "findByWorkOrder", null);
__decorate([
    (0, common_1.Put)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: '更新维修项' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkItemsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: '删除维修项' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkItemsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':workOrderId/work-items'),
    (0, swagger_1.ApiOperation)({ summary: '获取工单的工作项（分页）' }),
    __param(0, (0, common_1.Param)('workOrderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkItemsController.prototype, "findByOrderIdWithPagination", null);
__decorate([
    (0, common_1.Get)(':workOrderId/total-cost'),
    (0, swagger_1.ApiOperation)({ summary: '获取工单的总费用' }),
    __param(0, (0, common_1.Param)('workOrderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkItemsController.prototype, "getTotalCost", null);
exports.WorkItemsController = WorkItemsController = __decorate([
    (0, swagger_1.ApiTags)('维修项管理'),
    (0, common_1.Controller)('work-orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [work_items_service_1.WorkItemsService])
], WorkItemsController);
//# sourceMappingURL=work-items.controller.js.map