import { Controller, Get } from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
import { IVehicleType } from '@ayahay/models';

@Controller('vehicle-types')
export class VehicleTypeController {
  constructor(private vehicleTypeService: VehicleTypeService) {}

  @Get()
  async getVehicleTypes(): Promise<IVehicleType[]> {
    return await this.vehicleTypeService.getVehicleTypes();
  }
}
