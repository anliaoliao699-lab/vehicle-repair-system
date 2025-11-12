// src/your-service/your.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YourService {
  constructor(private configService: ConfigService) {}

  getConfig() {
    const dbHost = this.configService.get<string>('DB_HOST');
    const dbPort = this.configService.get<number>('DB_PORT');
    // 获取其他配置...
    return { dbHost, dbPort };
  }
}