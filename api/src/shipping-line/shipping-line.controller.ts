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
import { ShippingLineService } from './shipping-line.service';

@Controller('shipping-lines')
export class ShippingLineController {
  constructor(private shippingLineService: ShippingLineService) {}
}
