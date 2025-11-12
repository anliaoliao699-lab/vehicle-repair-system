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
exports.PhotosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const photo_entity_1 = require("../entities/photo.entity");
let PhotosService = class PhotosService {
    constructor(photoRepository) {
        this.photoRepository = photoRepository;
    }
    async create(createDto, userId) {
        const photo = this.photoRepository.create({
            ...createDto,
            uploadedBy: userId,
        });
        return this.photoRepository.save(photo);
    }
    async findByWorkOrder(workOrderId) {
        return this.photoRepository.find({
            where: { workOrderId },
            relations: ['uploader'],
            order: { createdAt: 'DESC' },
        });
    }
    async remove(id) {
        await this.photoRepository.delete(id);
        return { message: '删除成功' };
    }
};
exports.PhotosService = PhotosService;
exports.PhotosService = PhotosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(photo_entity_1.Photo)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PhotosService);
//# sourceMappingURL=photos.service.js.map