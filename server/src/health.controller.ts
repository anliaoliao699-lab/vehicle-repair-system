import { Controller, Get } from '@nestjs/common';
import { DatabaseMonitorService } from './database-monitor.service';

@Controller('health')
export class HealthController {
  constructor(private dbMonitor: DatabaseMonitorService) {}

  @Get()
  async health() {
    const dbStatus = await this.dbMonitor.checkHealth();
    
    const isHealthy = dbStatus.status === 'ok' && dbStatus.database === 'connected';
    
    return {
      // ✅ 整体健康状态
      status: isHealthy ? 'healthy' : 'unhealthy',
      
      // ✅ 数据库状态
      database: {
        status: dbStatus.database,
        checked: dbStatus.timestamp,
      },
      
      // ✅ 应用信息
      application: {
        uptime: dbStatus.uptime,
        memory: dbStatus.memory,
        version: '1.0.0',
      },
      
      // ✅ 系统信息
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      
      // ✅ 检查时间
      timestamp: dbStatus.timestamp,
    };
  }
}