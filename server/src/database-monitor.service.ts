import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DatabaseMonitorService {
  private readonly logger = new Logger('DatabaseMonitor');
  private monitorInterval: NodeJS.Timeout;

  // ✅ 使用 any 类型兼容所有 TypeORM 版本
  constructor(private dataSource: any) {
    this.startMonitoring();
  }

  private startMonitoring() {
    // ✅ 每 60 秒检查一次数据库连接
    this.monitorInterval = setInterval(async () => {
      try {
        const result = await this.dataSource.query('SELECT 1');
        const memUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const memTotal = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);
        
        this.logger.debug(
          `✅ Health check passed | Memory: ${memUsed}MB/${memTotal}MB | Uptime: ${Math.round(process.uptime())}s`
        );
      } catch (error) {
        this.logger.error(
          `❌ Health check failed: ${error.message}`,
          error.stack
        );
        
        // ✅ 如果连接失败，尝试重新初始化
        if (this.dataSource && this.dataSource.isInitialized === false) {
          this.logger.warn('DataSource not initialized, attempting to reconnect...');
          try {
            if (this.dataSource.initialize && typeof this.dataSource.initialize === 'function') {
              await this.dataSource.initialize();
              this.logger.log('✅ DataSource reconnected successfully');
            }
          } catch (err) {
            this.logger.error('❌ Failed to reconnect:', err);
          }
        }
      }
    }, 60000); // 60 秒执行一次
  }

  async checkHealth(): Promise<{
    status: string;
    database: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
    };
    timestamp: string;
  }> {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        database: 'connected',
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ✅ 清理资源（应用关闭时调用）
  onModuleDestroy() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.logger.log('Database monitor stopped');
    }
  }
}