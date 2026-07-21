import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS pour le frontend Next.js
  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
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

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 StageIA API démarrée sur http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Documentation Swagger : http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();