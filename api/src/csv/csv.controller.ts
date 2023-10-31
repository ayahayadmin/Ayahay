import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CsvService } from './csv.service';
import { AuthGuard } from 'src/guard/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { Blob } from 'buffer';

@Controller('csv')
export class CsvController {
  constructor(private csvService: CsvService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles('SuperAdmin', 'Admin')
  async generateBookingCsv(@Body() bookings: any[]) {
    return await this.csvService.generateBookingCsv(bookings);
  }
}
