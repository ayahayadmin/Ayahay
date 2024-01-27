import { Module } from '@nestjs/common';
import { DisbursementService } from './disbursement.service';
import { PrismaService } from '@/prisma.service';
import { DisbursementController } from './disbursement.controller';

@Module({
  controllers: [DisbursementController],
  providers: [DisbursementService, PrismaService],
})
export class DisbursementModule {}
