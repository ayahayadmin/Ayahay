import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaService } from '@/prisma.service';
import { EmailController } from './email.controller';

@Module({
  controllers: [EmailController],
  providers: [EmailService, PrismaService],
  exports: [EmailService],
})
export class EmailModule {}
