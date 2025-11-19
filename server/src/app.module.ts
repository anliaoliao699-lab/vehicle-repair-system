import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
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
      load: [
        () => ({
          PORT: process.env.PORT,
          DB_HOST: process.env.DB_HOST,
          DB_PORT: process.env.DB_PORT,
          DB_USERNAME: process.env.DB_USERNAME,
          DB_PASSWORD: process.env.DB_PASSWORD,
          DB_DATABASE: process.env.DB_DATABASE,
          DB_SYNC: process.env.DB_SYNC === 'true',
          DB_LOGGING: process.env.DB_LOGGING === 'true',
          JWT_SECRET: process.env.JWT_SECRET,
          JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
          JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
          JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
          OSS_REGION: process.env.OSS_REGION,
          OSS_ACCESS_KEY_ID: process.env.OSS_ACCESS_KEY_ID,
          OSS_ACCESS_KEY_SECRET: process.env.OSS_ACCESS_KEY_SECRET,
          OSS_BUCKET: process.env.OSS_BUCKET,
          OSS_ENDPOINT: process.env.OSS_ENDPOINT,
          WECHAT_APPID: process.env.WECHAT_APPID,
          WECHAT_SECRET: process.env.WECHAT_SECRET,
          ALIPAY_APPID: process.env.ALIPAY_APPID,
          ALIPAY_PRIVATE_KEY: process.env.ALIPAY_PRIVATE_KEY,
          ALIPAY_PUBLIC_KEY: process.env.ALIPAY_PUBLIC_KEY,
        }),
      ],
    }),
    // ✅ 改进的 TypeORM 配置 - 关键改动只在这里
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'vehicle_repair',
      synchronize: false,
      logging: false,
      autoLoadEntities: true,
      
      // ✅ 关键：连接池和重试配置
      retryAttempts: 5,         // 重连 5 次
      retryDelay: 3000,         // 每次间隔 3 秒
      keepConnectionAlive: true, // 保持连接活跃
      
      // ✅ MySQL 驱动特定配置
      extra: {
        connectionLimit: 20,      // 最大 20 个连接
        waitForConnections: true, // 等待可用连接
        queueLimit: 0,           // 不限制等待队列
        connectionTimeout: 10000, // 10秒连接超时
        acquireTimeout: 30000,    // 30秒获取超时
        idleTimeout: 30000,       // 30秒空闲超时
        enableKeepAlive: true,    // 启用心跳保活
        keepAliveInitialDelaySeconds: 0,
        keepAliveInterval: 30000, // 每30秒发送心跳
        supportBigNumbers: true,
        bigNumberStrings: true,
        charset: 'utf8mb4',
        timezone: 'Z',
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
// ✅ 保持最小化 - 什么都不加，让应用首先成功启动
export class AppModule {}