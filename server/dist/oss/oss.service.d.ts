export declare class OssService {
    private client;
    constructor();
    uploadFile(file: Express.Multer.File): Promise<string>;
}
