import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
export declare class VehiclesController {
    private vehiclesService;
    constructor(vehiclesService: VehiclesService);
    create(req: any, createVehicleDto: CreateVehicleDto): Promise<import("../entities/vehicle.entity").Vehicle>;
    findAll(req: any, ownerId?: string): Promise<import("../entities/vehicle.entity").Vehicle[]>;
    findOne(id: string): Promise<import("../entities/vehicle.entity").Vehicle>;
    update(id: string, updateData: any): Promise<import("../entities/vehicle.entity").Vehicle>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
