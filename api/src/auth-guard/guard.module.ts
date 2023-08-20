import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [AuthGuard, PrismaService],
})
export class GuardModule {}
