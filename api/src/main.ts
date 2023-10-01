import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  await app.enableShutdownHooks();

  app.enableCors({
    origin: [
      process.env.NEXT_PUBLIC_WEB_URL,
      process.env.NEXT_PUBLIC_ADMIN_URL,
      process.env.DRAGONPAY_GATEWAY_URL,
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    })
  );

  await app.listen(process.env.PORT || 3001, '0.0.0.0');
}
bootstrap();
