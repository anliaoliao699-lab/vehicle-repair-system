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
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const material_entity_1 = require("../entities/material.entity");
let MaterialsService = class MaterialsService {
    constructor(materialRepository) {
        this.materialRepository = materialRepository;
    }
    async create(createDto) {
        const material = this.materialRepository.create(createDto);
        return this.materialRepository.save(material);
    }
    async findAll(filters) {
        const queryBuilder = this.materialRepository.createQueryBuilder('m');
        return queryBuilder.orderBy('m.createdAt', 'DESC').getMany();
    }
    async findOne(id) {
        const material = await this.materialRepository.findOne({ where: { id } });
        if (!material) {
            throw new common_1.NotFoundException('材料不存在');
        }
        return material;
    }
    async update(id, updateData) {
        await this.findOne(id);
        await this.materialRepository.update(id, updateData);
        return this.findOne(id);
    }
    async delete(id) {
        await this.findOne(id);
        await this.materialRepository.delete(id);
        return { message: '删除成功' };
    }
    async updateStock(id, quantity) {
        const material = await this.findOne(id);
        material.stock += quantity;
        if (material.stock < 0) {
            throw new common_1.BadRequestException('库存不足');
        }
        return this.materialRepository.save(material);
    }
};
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(material_entity_1.Material)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map