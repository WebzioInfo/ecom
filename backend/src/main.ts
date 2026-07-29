import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const cookieParser = require('cookie-parser');

async function bootstrap() {
  const startTime = Date.now();
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable NestJS Lifecycle Shutdown Hooks
  app.enableShutdownHooks();

  // Set API version prefix
  app.setGlobalPrefix('api/v1');

  // 1. CORS Configuration (MUST be registered FIRST for preflight OPTIONS requests)
  const corsOrigins = configService.get<string[]>('corsWhitelist') || [];
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // In development or if origin matches allowed domains/subdomains, permit
      if (
        corsOrigins.includes(origin) ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
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
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // 2. Security Headers & Cookie Parser
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  );
  app.use(cookieParser());

  // 3. Rate Limiting (Generous limits for dev, bypass localhost)
  const isDev = configService.get<string>('environment') !== 'production' || process.env.NODE_ENV !== 'production';
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isDev ? 10000 : 1000,
      skip: (req) =>
        isDev ||
        req.ip === '127.0.0.1' ||
        req.ip === '::1' ||
        req.ip === '::ffff:127.0.0.1' ||
        req.headers['x-forwarded-for'] === '127.0.0.1',
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  // 4. Global Validation Pipe
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

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Enterprise Ecommerce Platform API')
    .setDescription('Multi-Tenant SaaS Backend Engine Foundation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(configService.get<number>('port')) || 4001;

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
    logger.log(`• Environment : ${configService.get<string>('environment')}`);
    logger.log(`• Server Port : ${port}`);
    logger.log(`• API Base    : http://localhost:${port}/api/v1`);
    logger.log(`• Swagger Docs: http://localhost:${port}/api/docs`);
    logger.log(`• Startup Time: ${duration}ms`);
    logger.log('====================================================');
  } catch (error: any) {
    if (error?.code === 'EADDRINUSE') {
      logger.error(`FATAL ERROR: PORT ${port} IS ALREADY IN USE`);
    } else {
      logger.error('Failed to start application', error?.stack ?? error);
    }
    process.exit(1);
  }
}

void bootstrap().catch((err) => {
  Logger.error('Bootstrap failed', err);
});
