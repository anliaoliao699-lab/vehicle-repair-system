import { Repository } from 'typeorm';
import { Material } from '../entities/material.entity';
export declare class MaterialsService {
    private materialRepository;
    constructor(materialRepository: Repository<Material>);
    create(createDto: any): Promise<Material[]>;
    findAll(filters?: any): Promise<Material[]>;
    findOne(id: number): Promise<Material>;
    update(id: number, updateData: Partial<Material>): Promise<Material>;
    delete(id: number): Promise<{
        message: string;
    }>;
    updateStock(id: number, quantity: number): Promise<Material>;
}
