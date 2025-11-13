// src/main.ts

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
    console.log('✅ Nest application created');
    
    console.log('\n🔄 Configuring CORS...');
    app.enableCors({
      origin: true,
      credentials: true,
    });
    console.log('✅ CORS enabled');
    
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = '0.0.0.0';
    
    console.log(`\n🔄 Starting server on ${host}:${port}...`);
    
    // 删除回调，直接等待
    await app.listen(port, host);
    
    // 现在输出成功日志
    console.log('========================================');
    console.log(`✅ SUCCESS! Server is running`);
    console.log(`📍 Listening on: ${host}:${port}`);
    console.log('========================================');
    
  } catch (error) {
    console.error('========================================');
    console.error('❌ CRITICAL ERROR');
    console.error('========================================');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Stack Trace:', error.stack);
    console.error('========================================');
    
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Uncaught error:', err);
  process.exit(1);
});