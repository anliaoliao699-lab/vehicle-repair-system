// src/work-orders/work-orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrder } from '../entities/work-order.entity';
import { User } from '../entities/user.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { LogsModule } from '../logs/logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OssModule } from '../oss/oss.module'; // ✅ 导入模块
import { Photo } from '../entities/photo.entity'; 
@Module({
  imports: [
  TypeOrmModule.forFeature([WorkOrder, User, Vehicle, Photo]),
    LogsModule,
    NotificationsModule,
    OssModule
  ],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}