import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  await app.enableShutdownHooks();

  app.enableCors({
    origin: [process.env.WEB_URL, process.env.ADMIN_URL],
  });
  await app.listen(process.env.PORT || 3001, '0.0.0.0');
}
bootstrap();
