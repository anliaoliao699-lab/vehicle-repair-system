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
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const uploads_service_1 = require("./uploads.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const OSS = require("ali-oss");
let UploadsController = class UploadsController {
    constructor(uploadsService) {
        this.uploadsService = uploadsService;
        this.ossClient = new OSS({
            region: process.env.OSS_REGION,
            accessKeyId: process.env.OSS_ACCESS_KEY_ID,
            accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
            bucket: process.env.OSS_BUCKET,
        });
        this.mirrorOssClient = new OSS({
            region: 'oss-cn-hongkong',
            accessKeyId: process.env.OSS_ACCESS_KEY_ID,
            accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
            bucket: 'vehicle-repair-mirror',
        });
    }
    getUploadSignature(filename, contentType) {
        return this.uploadsService.getUploadSignature(filename, contentType);
    }
    async findAll(query) {
        const uploads = await this.uploadsService.findAll(query);
        return uploads.map(item => ({
            ...item,
            url: this.mirrorOssClient.signatureUrl(`uploads/${item.filename}`, { expires: 3600 }),
        }));
    }
    async findOne(id) {
        const upload = await this.uploadsService.findOne(+id);
        if (!upload)
            return null;
        return {
            ...upload,
            url: this.mirrorOssClient.signatureUrl(`uploads/${upload.filename}`, { expires: 3600 }),
        };
    }
    async uploadFile(file, relatedType, relatedId) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const ext = file.originalname.split('.').pop();
        const filename = `${timestamp}-${randomStr}.${ext}`;
        const ossPath = `uploads/${filename}`;
        try {
            await this.ossClient.put(ossPath, file.buffer);
            const mirroredUrl = this.mirrorOssClient.signatureUrl(ossPath, { expires: 3600 });
            const upload = await this.uploadsService.create({
                filename: filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                url: mirroredUrl,
                relatedType: relatedType || null,
                relatedId: relatedId ? parseInt(relatedId) : null,
            });
            return upload;
        }
        catch (error) {
            console.error('上传失败:', error);
            throw error;
        }
    }
    async remove(id) {
        return this.uploadsService.remove(+id);
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('sign'),
    (0, swagger_1.ApiOperation)({ summary: '获取OSS上传签名' }),
    __param(0, (0, common_1.Body)('filename')),
    __param(1, (0, common_1.Body)('contentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UploadsController.prototype, "getUploadSignature", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取上传记录列表' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取单个上传记录' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: '直接上传文件' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('relatedType')),
    __param(2, (0, common_1.Query)('relatedId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除上传记录' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "remove", null);
exports.UploadsController = UploadsController = __decorate([
    (0, swagger_1.ApiTags)('文件上传'),
    (0, common_1.Controller)('uploads'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [uploads_service_1.UploadsService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map