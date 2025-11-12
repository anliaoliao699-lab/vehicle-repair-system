import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../entities/log.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async create(createDto: any) {
    const log = this.logRepository.create(createDto);
    return this.logRepository.save(log);
  }

  async findAll(filters?: any) {
    const { userId, startDate, endDate } = filters || {};
    
    const queryBuilder = this.logRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
    }

    return queryBuilder.orderBy('log.createdAt', 'DESC').getMany();
  }
}