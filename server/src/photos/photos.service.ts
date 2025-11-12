import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from '../entities/photo.entity';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
  ) {}

  async create(createDto: any, userId: number) {
    const photo = this.photoRepository.create({
      ...createDto,
      uploadedBy: userId,
    });
    return this.photoRepository.save(photo);
  }

  async findByWorkOrder(workOrderId: number) {
    return this.photoRepository.find({
      where: { workOrderId },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number) {
    await this.photoRepository.delete(id);
    return { message: '删除成功' };
  }
}