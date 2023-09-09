import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { VehicleTypeController } from './vehicle-type.controller';
import { VehicleTypeService } from './vehicle-type.service';

@Module({
  controllers: [VehicleTypeController],
  providers: [VehicleTypeService, PrismaService],
})
export class VehicleTypeModule {}
