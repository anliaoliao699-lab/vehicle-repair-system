import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { getConnection } from 'typeorm';

@Injectable()
export class DatabaseMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('DatabaseMonitor');
  private monitorInterval: NodeJS.Timeout;
  private dataSource: any;

  // ✅ 不通过构造函数注入，避免循环依赖问题
  constructor() {
    this.logger.log('DatabaseMonitorService initialized');
  }

  async onModuleInit() {
    // ✅ 在模块初始化时获取数据库连接
    try {
      this.logger.log('Getting database connection...');
      this.dataSource = getConnection();
      this.logger.log('✅ Database connection obtained');
      
      // ✅ 验证连接
      await this.dataSource.query('SELECT 1');
      this.logger.log('✅ Database connection verified on startup');
      
      // ✅ 启动监控
      this.startMonitoring();
    } catch (error) {
      this.logger.error(`❌ Failed to get database connection: ${error.message}`, error.stack);
      // 继续运行，但不会定期检查数据库
    }
  }

  private startMonitoring() {
    // ✅ 每 60 秒检查一次数据库连接
    this.monitorInterval = setInterval(async () => {
      try {
        if (!this.dataSource) {
          // 尝试重新获取连接
          try {
            this.dataSource = getConnection();
          } catch (err) {
            this.logger.warn('DataSource still not available');
            return;
          }
        }

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
      if (!this.dataSource) {
        try {
          this.dataSource = getConnection();
        } catch (err) {
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
      this.logger.error(`Check health failed: ${error.message}`);
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