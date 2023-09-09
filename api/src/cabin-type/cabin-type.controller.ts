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
import { CabinTypeService } from './cabin-type.service';
import { ICabinType } from '@ayahay/models';

@Controller('cabin-types')
export class CabinTypeController {
  constructor(private cabinTypeService: CabinTypeService) {}

  @Get()
  async getCabinTypes(): Promise<ICabinType[]> {
    return await this.cabinTypeService.getCabinTypes();
  }
}
