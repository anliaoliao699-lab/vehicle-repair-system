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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vehicle_entity_1 = require("../entities/vehicle.entity");
let VehiclesService = class VehiclesService {
    constructor(vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }
    async create(createVehicleDto) {
        const existVehicle = await this.vehicleRepository.findOne({
            where: { plateNumber: createVehicleDto.licensePlate },
        });
        if (existVehicle) {
            throw new common_1.BadRequestException('车牌号已存在');
        }
        const vehicle = this.vehicleRepository.create(createVehicleDto);
        return this.vehicleRepository.save(vehicle);
    }
    async findAll(customerId) {
        let where = {};
        if (customerId !== undefined) {
            where.customerId = customerId;
        }
        else {
            where = undefined;
        }
        return this.vehicleRepository.find({
            ...(where ? { where } : {}),
            relations: ['customer'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id },
            relations: ['customer'],
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('车辆不存在');
        }
        return vehicle;
    }
    async update(id, updateData) {
        await this.findOne(id);
        await this.vehicleRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        const vehicle = await this.findOne(id);
        await this.vehicleRepository.remove(vehicle);
        return { message: '删除成功' };
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vehicle_entity_1.Vehicle)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map