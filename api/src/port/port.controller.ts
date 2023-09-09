import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PortService } from './port.service';
import { IPort } from '@ayahay/models';

@Controller('ports')
export class PortController {
  constructor(private portService: PortService) {}

  @Get()
  async getPorts(): Promise<IPort[]> {
    return await this.portService.getPorts();
  }
}
