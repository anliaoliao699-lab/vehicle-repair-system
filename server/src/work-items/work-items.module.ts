// src/work-items/work-items.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkItemsService } from './work-items.service';
import { WorkItemsController } from './work-items.controller';
import { WorkItem } from '../entities/work-item.entity';
import { WorkOrder } from '../entities/work-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkItem, WorkOrder])],  // ✅ 添加 WorkOrder
  controllers: [WorkItemsController],
  providers: [WorkItemsService],
  exports: [WorkItemsService],
})
export class WorkItemsModule {}