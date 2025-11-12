"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const work_orders_module_1 = require("./work-orders/work-orders.module");
const work_items_module_1 = require("./work-items/work-items.module");
const materials_module_1 = require("./materials/materials.module");
const photos_module_1 = require("./photos/photos.module");
const payments_module_1 = require("./payments/payments.module");
const logs_module_1 = require("./logs/logs.module");
const notifications_module_1 = require("./notifications/notifications.module");
const reports_module_1 = require("./reports/reports.module");
const uploads_module_1 = require("./uploads/uploads.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
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
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
                username: process.env.DB_USERNAME || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_DATABASE || 'vehicle_repair',
                synchronize: false,
                logging: false,
                autoLoadEntities: true,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            vehicles_module_1.VehiclesModule,
            work_orders_module_1.WorkOrdersModule,
            work_items_module_1.WorkItemsModule,
            materials_module_1.MaterialsModule,
            photos_module_1.PhotosModule,
            payments_module_1.PaymentsModule,
            logs_module_1.LogsModule,
            notifications_module_1.NotificationsModule,
            reports_module_1.ReportsModule,
            uploads_module_1.UploadsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map