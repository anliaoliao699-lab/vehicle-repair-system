import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto) {
    // 字段名与 Vehicle 实体一致，数据库字段为 plate_number，实体为 plateNumber
    const existVehicle = await this.vehicleRepository.findOne({
      where: { plateNumber: createVehicleDto.licensePlate },
    });

    if (existVehicle) {
      throw new BadRequestException('车牌号已存在');
    }

    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async findAll(customerId?: number) {
    // customerId 字段名与实体一致
    let where: any = {};
    if (customerId !== undefined) {
      where.customerId = customerId;
    } else {
      where = undefined;
    }
    return this.vehicleRepository.find({
      ...(where ? { where } : {}),
      relations: ['customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!vehicle) {
      throw new NotFoundException('车辆不存在');
    }

    return vehicle;
  }

  async update(id: number, updateData: Partial<Vehicle>) {
    await this.findOne(id);
    await this.vehicleRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const vehicle = await this.findOne(id);
    await this.vehicleRepository.remove(vehicle);
    return { message: '删除成功' };
  }
}
