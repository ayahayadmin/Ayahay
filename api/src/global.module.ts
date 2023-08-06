import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UtilityService } from './utility.service';
import { MapperModule } from './mapper.module';

@Global()
@Module({
  imports: [MapperModule],
  providers: [PrismaService, UtilityService],
  exports: [MapperModule, PrismaService, UtilityService],
})
export class GlobalModule {}
