// src/your-controller/your.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { YourService } from './order.service';

@Controller('your-controller')
export class YourController {
  constructor(
    private configService: ConfigService,
    private yourService: YourService,
  ) {}

  @Get('config')
  getConfig() {
    const dbConfig = this.yourService.getConfig();
    return dbConfig;
  }
}