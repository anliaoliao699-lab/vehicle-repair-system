import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private uploadsService;
    private ossClient;
    private mirrorOssClient;
    constructor(uploadsService: UploadsService);
    getUploadSignature(filename: string, contentType: string): {
        url: string;
        ossAccessKeyId: string;
        policy: string;
        signature: string;
        key: string;
        callback: string;
        expire: number;
        host: string;
        dir: string;
    };
    findAll(query: any): Promise<{
        url: string;
        id: number;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        relatedType: string;
        relatedId: number;
        uploadedBy: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        url: string;
        id: number;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        relatedType: string;
        relatedId: number;
        uploadedBy: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadFile(file: Express.Multer.File, relatedType?: string, relatedId?: string): Promise<import("../entities/upload.entity").Upload[]>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
