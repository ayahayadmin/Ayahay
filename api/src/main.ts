import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import admin from 'firebase-admin';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.CLIENT_EMAIL,
    }),
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      rawBody: true,
    }
  );

  await app.enableShutdownHooks();

  app.enableCors({
    origin: [
      process.env.WEB_URL,
      process.env.ADMIN_URL,
      process.env.AZNAR_URL,
      process.env.JOMALIA_URL,
      process.env.DRAGONPAY_GATEWAY_URL,
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    })
  );

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Ayahay OpenAPI Specification')
    .setDescription('The Ayahay API description')
    .setVersion('1.0')
    .addTag('Bookings')
    .addTag('Payments')
    .addTag('Trips')
    .addTag('Ports')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('specs', app, document);

  await app.listen(process.env.PORT || 3001, '0.0.0.0');
}
bootstrap();
