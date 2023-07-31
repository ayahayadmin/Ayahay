import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma.service';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [BookingModule],
  controllers: [PaymentController],
  providers: [PrismaService, PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
