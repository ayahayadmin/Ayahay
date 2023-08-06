import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { IPassenger } from '@ayahay/models';

@Controller('passenger')
export class PassengerController {
  constructor(private passengerService: PassengerService) {}

  @Post()
  async createPassenger(@Body() passenger: IPassenger) {
    return await this.passengerService.createPassenger(passenger);
  }
}
