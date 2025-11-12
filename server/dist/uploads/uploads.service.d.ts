import { Repository } from 'typeorm';
import { Upload } from '../entities/upload.entity';
export declare class UploadsService {
    private uploadRepository;
    private ossClient;
    constructor(uploadRepository: Repository<Upload>);
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
    findAll(query: any): Promise<Upload[]>;
    findOne(id: number): Promise<Upload>;
    create(data: any): Promise<Upload[]>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
