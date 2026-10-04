import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Fichiers téléversés (logos de programmes, miniatures de cours…) servis sur /uploads/...
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  // CORS pour le frontend Next.js : origines de développement + URLs déployées.
  // FRONTEND_URL accepte plusieurs URLs séparées par des virgules (ex. prod + preview).
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    ...(process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
      : []),
  ];
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('StageIA API')
    .setDescription('API de la plateforme de formation StageIA')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3020);
  console.log(`StageIA API démarrée sur http://localhost:${process.env.PORT ?? 3020}`);
  console.log(`Documentation Swagger : http://localhost:${process.env.PORT ?? 3020}/api/docs`);
}
bootstrap();
