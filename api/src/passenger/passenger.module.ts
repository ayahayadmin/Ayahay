import { Module } from '@nestjs/common';
import { PassengerController } from './passenger.controller';
import { PassengerService } from './passenger.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [PassengerController],
  providers: [PassengerService, PrismaService],
})
export class PassengerModule {}
