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
exports.WorkItemsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const work_item_entity_1 = require("../entities/work-item.entity");
let WorkItemsService = class WorkItemsService {
    constructor(workItemRepository) {
        this.workItemRepository = workItemRepository;
    }
    async create(workOrderId, createDto) {
        if (!createDto.item_name || createDto.price === undefined) {
            throw new common_1.BadRequestException('缺少必填字段: item_name, price');
        }
        if (parseFloat(createDto.price) <= 0) {
            throw new common_1.BadRequestException('项目费用必须大于0');
        }
        const workItem = this.workItemRepository.create({
            orderId: workOrderId,
            name: createDto.item_name,
            description: createDto.description,
            price: parseFloat(createDto.price),
            status: createDto.status || 'pending'
        });
        return this.workItemRepository.save(workItem);
    }
    async findByWorkOrder(workOrderId) {
        return this.workItemRepository.find({
            where: { orderId: workOrderId },
            order: { createdAt: 'DESC' },
        });
    }
    async findByOrderId(orderId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = await this.workItemRepository.findAndCount({
            where: { orderId },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return {
            items,
            total,
        };
    }
    async getTotalCostByOrderId(orderId) {
        const result = await this.workItemRepository
            .createQueryBuilder('work_item')
            .select('SUM(work_item.price)', 'total')
            .where('work_item.orderId = :orderId', { orderId })
            .getRawOne();
        return result?.total || 0;
    }
    async update(id, updateData) {
        const workItem = await this.workItemRepository.findOne({ where: { id } });
        if (!workItem) {
            throw new common_1.NotFoundException('维修项不存在');
        }
        if (updateData.price !== undefined && parseFloat(updateData.price) <= 0) {
            throw new common_1.BadRequestException('项目费用必须大于0');
        }
        await this.workItemRepository.update(id, updateData);
        return this.workItemRepository.findOne({ where: { id } });
    }
    async remove(id) {
        const workItem = await this.workItemRepository.findOne({ where: { id } });
        if (!workItem) {
            throw new common_1.NotFoundException('维修项不存在');
        }
        await this.workItemRepository.remove(workItem);
        return { message: '删除成功', id };
    }
};
exports.WorkItemsService = WorkItemsService;
exports.WorkItemsService = WorkItemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(work_item_entity_1.WorkItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WorkItemsService);
//# sourceMappingURL=work-items.service.js.map