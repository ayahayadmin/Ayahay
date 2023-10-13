import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { Roles } from 'src/decorator/roles.decorator';
import { IPassenger } from '@ayahay/models';
import { AuthGuard } from 'src/guard/auth.guard';
import { AllowUnverifiedPassengers } from 'src/decorator/verified.decorator';

@Controller('passengers')
@UseGuards(AuthGuard)
export class PassengerController {
  constructor(private passengerService: PassengerService) {}

  @Post()
  @Roles('Passenger')
  @AllowUnverifiedPassengers()
  async createPassenger(@Body() data: IPassenger): Promise<IPassenger> {
    return await this.passengerService.createPassenger(data);
  }
}
