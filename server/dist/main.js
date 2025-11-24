"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
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
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        console.log('✅ Nest application created successfully');
        console.log('\n🔄 Configuring CORS...');
        app.enableCors({
            origin: true,
            credentials: true,
        });
        console.log('✅ CORS configured');
        app.use('/health', (req, res) => {
            if (req.method === 'GET') {
                res.status(200).json({
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    environment: process.env.NODE_ENV || 'unknown'
                });
            }
            else {
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
        console.log('📌 API routes available at: GET /api/*');
        console.log('========================================');
        server.on('error', (err) => {
            console.error('❌ Server error event:', err);
        });
        process.on('SIGTERM', async () => {
            console.log('⏸️  Received SIGTERM, gracefully shutting down...');
            await app.close();
            process.exit(0);
        });
        process.on('SIGINT', async () => {
            console.log('⏸️  Received SIGINT, gracefully shutting down...');
            await app.close();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('========================================');
        console.error('❌ ❌ ❌ CRITICAL ERROR');
        console.error('========================================');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Error Errno:', error.errno);
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
//# sourceMappingURL=main.js.map