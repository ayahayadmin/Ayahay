import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UtilityService } from './utility.service';
import { MapperModule } from './mapper.module';
import { GuardModule } from './auth-guard/guard.module';

@Global()
@Module({
  imports: [GuardModule, MapperModule],
  providers: [PrismaService, UtilityService],
  exports: [GuardModule, MapperModule, PrismaService, UtilityService],
})
export class GlobalModule {}
