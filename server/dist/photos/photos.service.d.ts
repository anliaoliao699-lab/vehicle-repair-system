import { Repository } from 'typeorm';
import { Photo } from '../entities/photo.entity';
export declare class PhotosService {
    private photoRepository;
    constructor(photoRepository: Repository<Photo>);
    create(createDto: any, userId: number): Promise<Photo[]>;
    findByWorkOrder(workOrderId: number): Promise<Photo[]>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
