
// materials.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from '../entities/material.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  async create(createDto: any) {
    const material = this.materialRepository.create(createDto);
    return this.materialRepository.save(material);
  }

  async findAll(filters?: any) {
    const queryBuilder = this.materialRepository.createQueryBuilder('m');
    return queryBuilder.orderBy('m.createdAt', 'DESC').getMany();
  }

  async findOne(id: number) {
    const material = await this.materialRepository.findOne({ where: { id } });
    if (!material) {
      throw new NotFoundException('材料不存在');
    }
    return material;
  }

  async update(id: number, updateData: Partial<Material>) {
    await this.findOne(id);
    await this.materialRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.materialRepository.delete(id);
    return { message: '删除成功' };
  }

  async updateStock(id: number, quantity: number) {
    const material = await this.findOne(id);
    material.stock += quantity;
    
    if (material.stock < 0) {
      throw new BadRequestException('库存不足');
    }

    return this.materialRepository.save(material);
  }
}