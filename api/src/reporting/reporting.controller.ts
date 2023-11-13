import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { AuthGuard } from 'src/guard/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { TripManifest } from '@ayahay/http';

@Controller('reporting')
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  @Get('trips/:id/manifest')
  @UseGuards(AuthGuard)
  @Roles('Staff', 'Admin', 'SuperAdmin')
  async getManifest(@Param('id') tripId: string): Promise<TripManifest> {
    return this.reportingService.getTripManifest(Number(tripId));
  }
}
