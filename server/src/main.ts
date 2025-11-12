import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🟢 Starting application...');
  console.log('🔹 Current DB_DATABASE:', process.env.DB_DATABASE);
  console.log('🔹 Current DB_HOST:', process.env.DB_HOST);
  console.log('🔹 NODE_ENV:', process.env.NODE_ENV);
  
  const app = await NestFactory.create(AppModule);
  
  // 启用 CORS（用于小程序跨域请求）
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  const host = '0.0.0.0';
  
  await app.listen(port, host);
  console.log(`✅ Application is running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});