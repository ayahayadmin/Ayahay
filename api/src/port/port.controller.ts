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

@Controller('ports')
export class PortController {
  constructor(private portService: PortService) {}
}
