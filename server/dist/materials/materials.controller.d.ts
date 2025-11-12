import { MaterialsService } from './materials.service';
export declare class MaterialsController {
    private materialsService;
    constructor(materialsService: MaterialsService);
    create(createDto: any): Promise<import("../entities/material.entity").Material[]>;
    findAll(filters: any): Promise<import("../entities/material.entity").Material[]>;
    findOne(id: string): Promise<import("../entities/material.entity").Material>;
    update(id: string, updateData: any): Promise<import("../entities/material.entity").Material>;
    updateStock(id: string, quantity: number): Promise<import("../entities/material.entity").Material>;
}
