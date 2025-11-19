import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { WorkItemsModule } from './work-items/work-items.module';
import { MaterialsModule } from './materials/materials.module';
import { PhotosModule } from './photos/photos.module';
import { PaymentsModule } from './payments/payments.module';
import { LogsModule } from './logs/logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'vehicle_repair',
      entities: [],
      autoLoadEntities: true,
      synchronize: false,
      logging: false,
      retryAttempts: 3,
      retryDelay: 3000,
      keepConnectionAlive: true,
      extra: {
        // ✅ 移除不支持的选项，只保留 mysql2 支持的
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelaySeconds: 0,
      }
    }),
    AuthModule,
    UsersModule,
    VehiclesModule,
    WorkOrdersModule,
    WorkItemsModule,
    MaterialsModule,
    PhotosModule,
    PaymentsModule,
    LogsModule,
    NotificationsModule,
    ReportsModule,
    UploadsModule,
  ],
})
export class AppModule {}