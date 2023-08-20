import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { IPassenger } from '@ayahay/models';
import { AuthGuard } from 'src/auth-guard/auth.guard';
import { Roles } from 'src/decorators/roles.decorators';

@Controller('passenger')
@UseGuards(AuthGuard)
@Roles('Passenger')
export class PassengerController {
  constructor(private passengerService: PassengerService) {}

  @Post()
  async createPassenger(@Body() passenger: IPassenger) {
    return await this.passengerService.createPassenger(passenger);
  }
}
