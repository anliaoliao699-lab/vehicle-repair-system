import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('========================================');
  console.log('🚀 [START] NestJS Application Bootstrap');
  console.log('========================================');
  
  console.log('📋 Environment Variables:');
  console.log('  • DB_DATABASE:', process.env.DB_DATABASE || '❌ NOT SET');
  console.log('  • DB_HOST:', process.env.DB_HOST || '❌ NOT SET');
  console.log('  • NODE_ENV:', process.env.NODE_ENV || '❌ NOT SET');
  console.log('  • PORT:', process.env.PORT || 'DEFAULT: 3000');
  
  try {
    console.log('\n🔄 Creating Nest application...');
    const app = await NestFactory.create(AppModule);
    console.log('✅ Nest application created successfully');
    
    console.log('\n🔄 Configuring CORS...');
    app.enableCors({
      origin: true,
      credentials: true,
    });
    console.log('✅ CORS configured');

    // 健康检查路由
    app.use('/health', (req, res) => {
      if (req.method === 'GET') {
        res.status(200).json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'unknown'
        });
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    });

    console.log('✅ Health check endpoint configured at /health');
    
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = '0.0.0.0';
    
    console.log(`\n🔄 Attempting to listen on ${host}:${port}...`);
    console.log('⏳ This step may take a moment...');
    
    const server = await app.listen(port, host);
    
    console.log('========================================');
    console.log('✅ ✅ ✅ SUCCESS! Application started!');
    console.log('========================================');
    console.log(`📍 Server is listening on ${host}:${port}`);
    console.log(`🌐 Ready to accept connections`);
    console.log('📌 Health check endpoint: GET /health');
    console.log('========================================');
    
    // 监听服务器错误
    server.on('error', (err) => {
      console.error('❌ Server error event:', err);
    });

    // ============================================
    // ✅ 真正有效的优雅关闭处理
    // ============================================
    
    let isShuttingDown = false;  // 防止多次关闭
    
    const gracefulShutdown = async (signal: string) => {
      // 防止多次触发关闭逻辑
      if (isShuttingDown) {
        console.log('⚠️  Shutdown already in progress, ignoring signal:', signal);
        return;
      }
      isShuttingDown = true;

      console.log(`\n========================================`);
      console.log(`⏸️  Received ${signal}, starting graceful shutdown...`);
      console.log(`========================================`);
      
      // 设置强制关闭超时（防止无限等待）
      const forceShutdownTimer = setTimeout(() => {
        console.error('⚠️  ⚠️  Force shutdown timeout reached (20s)');
        console.error('❌ Forcing process exit due to timeout');
        process.exit(1);
      }, 20000);  // 20秒强制关闭

      try {
        // 第1步：停止接收新的HTTP请求
        console.log('🔄 [Step 1/4] Stopping HTTP server from accepting new connections...');
        await new Promise<void>((resolve, reject) => {
          server.close((err) => {
            if (err) {
              console.error('⚠️  Error closing server:', err);
              reject(err);
            } else {
              console.log('✅ HTTP server stopped');
              resolve();
            }
          });
        });

        // 第2步：给现有请求一点时间完成
        console.log('🔄 [Step 2/4] Waiting for in-flight requests to complete (3s timeout)...');
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            console.log('✅ In-flight request timeout completed');
            resolve();
          }, 3000);
        });

        // 第3步：关闭Nest应用（会自动关闭数据库连接）
        console.log('🔄 [Step 3/4] Closing NestJS application and database connections...');
        const closePromise = app.close();
        const closeTimeout = setTimeout(() => {
          console.error('⚠️  Nest app close timeout - continuing anyway');
        }, 5000);
        
        await closePromise;
        clearTimeout(closeTimeout);
        console.log('✅ NestJS application closed');

        // 第4步：清理资源和退出
        console.log('🔄 [Step 4/4] Cleaning up resources...');
        clearTimeout(forceShutdownTimer);
        console.log('✅ Resources cleaned up');

        console.log(`========================================`);
        console.log(`✅ ✅ ✅ Graceful shutdown completed successfully`);
        console.log(`========================================`);
        console.log(`✨ Process will now exit with code 0`);
        
        // 安全退出
        process.exit(0);

      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        clearTimeout(forceShutdownTimer);
        console.error('💥 Force exiting due to shutdown error');
        process.exit(1);
      }
    };

    // 监听关闭信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // 处理未捕获的异常
    process.on('uncaughtException', (error, origin) => {
      console.error('========================================');
      console.error('❌ UNCAUGHT EXCEPTION');
      console.error('========================================');
      console.error('Error:', error);
      console.error('Origin:', origin);
      console.error('Stack:', error.stack);
      console.error('========================================');
      gracefulShutdown('uncaughtException');
    });

    // 处理未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      console.error('========================================');
      console.error('❌ UNHANDLED PROMISE REJECTION');
      console.error('========================================');
      console.error('Promise:', promise);
      console.error('Reason:', reason);
      if (reason instanceof Error) {
        console.error('Stack:', reason.stack);
      }
      console.error('========================================');
      gracefulShutdown('unhandledRejection');
    });
    
  } catch (error) {
    console.error('========================================');
    console.error('❌ ❌ ❌ CRITICAL ERROR DURING BOOTSTRAP');
    console.error('========================================');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', (error as any).code);
    console.error('Error Errno:', (error as any).errno);
    console.error('Full Error:', error);
    if (error.stack) {
      console.error('\nStack Trace:');
      console.error(error.stack);
    }
    console.error('========================================');
    console.error('💥 Application startup failed');
    
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('========================================');
  console.error('❌ UNCAUGHT BOOTSTRAP ERROR');
  console.error('========================================');
  console.error('Error:', err);
  console.error('========================================');
  process.exit(1);
});