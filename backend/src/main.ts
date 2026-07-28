import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const startTime = Date.now();
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable NestJS Lifecycle Shutdown Hooks (onModuleDestroy, beforeApplicationShutdown)
  app.enableShutdownHooks();

  // Set API version prefix
  app.setGlobalPrefix('api/v1');

  // Security headers
  app.use(helmet());

  // Rate limiting (100 requests per 15 minutes per IP)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  const corsOrigins = configService.get<string[]>('corsWhitelist');
  app.enableCors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'Origin',
      'X-Requested-With',
      'x-store-id',
      'x-store-slug',
      'x-api-key',
    ],
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Enterprise Ecommerce Platform API')
    .setDescription('Multi-Tenant SaaS Backend Engine')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = 4001;

  // Graceful Process Signals Handling
  const handleShutdown = async (signal: string) => {
    logger.warn(`Received ${signal}. Initiating graceful application shutdown...`);
    try {
      await app.close();
      logger.log(`NestJS application closed cleanly. Port ${port} released.`);
      process.exit(0);
    } catch (err) {
      logger.error(`Error during graceful shutdown: ${err}`);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  try {
    await app.listen(port);
    const duration = Date.now() - startTime;

    logger.log('====================================================');
    logger.log(`🚀 Ecommerce SaaS Platform Backend Engine Started`);
    logger.log(`• Environment : ${process.env.NODE_ENV || 'development'}`);
    logger.log(`• Server Port : ${port}`);
    logger.log(`• API Base    : http://localhost:${port}/api/v1`);
    logger.log(`• Swagger Docs: http://localhost:${port}/api/docs`);
    logger.log(`• Startup Time: ${duration}ms`);
    logger.log('====================================================');
  } catch (error: any) {
    if (error?.code === 'EADDRINUSE') {
      logger.error(`
┌─────────────────────────────────────────────────────────────┐
│ FATAL ERROR: PORT ${port} IS ALREADY IN USE                   │
├─────────────────────────────────────────────────────────────┤
│ Another process is occupying port ${port}.                    │
│ Run 'npm start' or 'node scripts/kill-port.js' to clear it.  │
└─────────────────────────────────────────────────────────────┘
      `);
    } else {
      logger.error('Failed to start application', error?.stack ?? error);
    }
    process.exit(1);
  }
}

void bootstrap().catch((err) => {
  Logger.error('Bootstrap failed', err);
});
