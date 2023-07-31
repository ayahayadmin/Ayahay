// shippingLine
import { Module } from '@nestjs/common';
import { ShippingLineController } from './shipping-line.controller';
import { ShippingLineService } from './shipping-line.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ShippingLineController],
  providers: [ShippingLineService, PrismaService],
})
export class ShippingLineModule {}
