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
exports.PhotosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const photos_service_1 = require("./photos.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PhotosController = class PhotosController {
    constructor(photosService) {
        this.photosService = photosService;
    }
    create(createDto, req) {
        return this.photosService.create(createDto, req.user.id);
    }
    findByWorkOrder(workOrderId) {
        return this.photosService.findByWorkOrder(+workOrderId);
    }
    remove(id) {
        return this.photosService.remove(+id);
    }
};
exports.PhotosController = PhotosController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '注册照片' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PhotosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('work-orders/:workOrderId'),
    (0, swagger_1.ApiOperation)({ summary: '获取工单的照片列表' }),
    __param(0, (0, common_1.Param)('workOrderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PhotosController.prototype, "findByWorkOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除照片' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PhotosController.prototype, "remove", null);
exports.PhotosController = PhotosController = __decorate([
    (0, swagger_1.ApiTags)('照片管理'),
    (0, common_1.Controller)('photos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [photos_service_1.PhotosService])
], PhotosController);
//# sourceMappingURL=photos.controller.js.map