import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { BookingService } from '../booking/booking.service';

@Module({
  imports: [AuthModule],
  controllers: [AccountController],
  providers: [AccountService, PrismaService],
  exports: [AccountService],
})
export class AccountModule {}
