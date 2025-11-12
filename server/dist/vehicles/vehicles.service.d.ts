import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
export declare class VehiclesService {
    private vehicleRepository;
    constructor(vehicleRepository: Repository<Vehicle>);
    create(createVehicleDto: CreateVehicleDto): Promise<Vehicle>;
    findAll(customerId?: number): Promise<Vehicle[]>;
    findOne(id: number): Promise<Vehicle>;
    update(id: number, updateData: Partial<Vehicle>): Promise<Vehicle>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
