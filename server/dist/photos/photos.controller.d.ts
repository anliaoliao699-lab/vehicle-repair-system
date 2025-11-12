import { PhotosService } from './photos.service';
export declare class PhotosController {
    private photosService;
    constructor(photosService: PhotosService);
    create(createDto: any, req: any): Promise<import("../entities/photo.entity").Photo[]>;
    findByWorkOrder(workOrderId: string): Promise<import("../entities/photo.entity").Photo[]>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
