

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

    app.getHttpServer().get('/health', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    });
    console.log('✅ CORS configured');
    
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = '0.0.0.0';
    
    console.log(`\n🔄 Attempting to listen on ${host}:${port}...`);
    console.log('⏳ This step may take a moment...');
    
    // 使用 getHttpServer 获取底层服务器
    const server = await app.listen(port, host);
    
    // 如果能执行到这里，说明 listen 成功了
    console.log('========================================');
    console.log('✅ ✅ ✅ SUCCESS! Application started!');
    console.log('========================================');
    console.log(`📍 Server is listening on ${host}:${port}`);
    console.log(`🌐 Ready to accept connections`);
    console.log('========================================');
    
    // 捕获任何服务器错误
    server.on('error', (err) => {
      console.error('❌ Server error event:', err);
    });
    
  } catch (error) {
    console.error('========================================');
    console.error('❌ ❌ ❌ CRITICAL ERROR');
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
    
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Uncaught bootstrap error:', err);
  process.exit(1);
});