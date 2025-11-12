// src/reports/reports.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('报表管理')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('daily')
  @ApiOperation({ summary: '日报' })
  @Roles(UserRole.ADMIN)
  getDailyReport(@Query('date') date: string) {
    return this.reportsService.getDailyReport(date);
  }

  @Get('worker-performance')
  @ApiOperation({ summary: '工人绩效报表' })
  getWorkerPerformance(
    @Query('workerId') workerId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getWorkerPerformance(+workerId, startDate, endDate);
  }
}
