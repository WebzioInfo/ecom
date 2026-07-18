import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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
    ],
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('The E-Commerce API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const preferredPort =
    configService.get<number>('port') ??
    parseInt(process.env.PORT ?? '4000', 10) ??
    4000;
  const fallbackPort = preferredPort === 4000 ? 4001 : preferredPort + 1;

  try {
    await app.listen(preferredPort);
    Logger.log(
      `Application is running on: http://localhost:${preferredPort}/api/v1`,
    );
    Logger.log(
      `Swagger docs available at: http://localhost:${preferredPort}/api/docs`,
    );
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError?.code === 'EADDRINUSE') {
      Logger.warn(
        `Port ${preferredPort} is already in use. Attempting fallback port ${fallbackPort}...`,
      );
      await app.listen(fallbackPort);
      Logger.log(
        `Application is running on: http://localhost:${fallbackPort}/api/v1`,
      );
      Logger.log(
        `Swagger docs available at: http://localhost:${fallbackPort}/api/docs`,
      );
    } else {
      Logger.error(
        'Failed to start application',
        nodeError?.stack ?? nodeError,
      );
      process.exit(1);
    }
  }
}

void bootstrap().catch((err) => {
  Logger.error('Bootstrap failed', err);
});
