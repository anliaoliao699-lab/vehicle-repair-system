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
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const upload_entity_1 = require("../entities/upload.entity");
const OSS = require("ali-oss");
let UploadsService = class UploadsService {
    constructor(uploadRepository) {
        this.uploadRepository = uploadRepository;
        this.ossClient = new OSS({
            region: process.env.OSS_REGION,
            accessKeyId: process.env.OSS_ACCESS_KEY_ID,
            accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
            bucket: process.env.OSS_BUCKET,
        });
    }
    getUploadSignature(filename, contentType) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const ext = filename.split('.').pop();
        const ossFilename = `uploads/${timestamp}-${randomStr}.${ext}`;
        const policy = {
            expiration: new Date(Date.now() + 3600000).toISOString(),
            conditions: [
                ['content-length-range', 0, 10485760],
                ['eq', '$bucket', process.env.OSS_BUCKET],
            ],
        };
        const signature = this.ossClient.calculatePostSignature(policy);
        const url = `https://${process.env.OSS_BUCKET}.${process.env.OSS_ENDPOINT.replace('https://', '')}`;
        return {
            url,
            ossAccessKeyId: process.env.OSS_ACCESS_KEY_ID,
            policy: signature.policy,
            signature: signature.Signature,
            key: ossFilename,
            callback: '',
            expire: Date.now() + 3600000,
            host: url,
            dir: 'uploads/',
        };
    }
    async findAll(query) {
        const { relatedType, relatedId } = query;
        const where = {};
        if (relatedType) {
            where.relatedType = relatedType;
        }
        if (relatedId) {
            where.relatedId = parseInt(relatedId);
        }
        return this.uploadRepository.find({ where });
    }
    async findOne(id) {
        return this.uploadRepository.findOne({ where: { id } });
    }
    async create(data) {
        const upload = this.uploadRepository.create(data);
        return this.uploadRepository.save(upload);
    }
    async remove(id) {
        const upload = await this.findOne(id);
        if (upload) {
            try {
                const ossPath = upload.url.split('.com/')[1];
                await this.ossClient.delete(ossPath);
            }
            catch (error) {
                console.error('从 OSS 删除失败:', error);
            }
            await this.uploadRepository.delete(id);
        }
        return { message: '删除成功' };
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(upload_entity_1.Upload)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map