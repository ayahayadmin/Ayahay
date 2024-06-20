import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RateTableService } from './rate-table.service';
import { IRateTable } from '@ayahay/models';
import { AllowUnauthenticated } from '@/decorator/authenticated.decorator';
import { AuthGuard } from '@/auth/auth.guard';

@Controller('rate-tables')
export class RateTableController {
  constructor(private rateTableService: RateTableService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  async getRateTableById(
    @Param('id') rateTableId: number
  ): Promise<IRateTable> {
    return this.rateTableService.getRateTableById(rateTableId);
  }
}
