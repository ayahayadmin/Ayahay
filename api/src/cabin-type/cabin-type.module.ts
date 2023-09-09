import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CabinTypeController } from './cabin-type.controller';
import { CabinTypeService } from './cabin-type.service';

@Module({
  controllers: [CabinTypeController],
  providers: [CabinTypeService, PrismaService],
})
export class CabinTypeModule {}
