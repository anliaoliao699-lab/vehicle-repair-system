"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    console.log('🟢 Starting application...');
    console.log('🔹 Current DB_DATABASE:', process.env.DB_DATABASE);
    console.log('🔹 Current DB_HOST:', process.env.DB_HOST);
    console.log('🔹 NODE_ENV:', process.env.NODE_ENV);
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
//# sourceMappingURL=main.js.map