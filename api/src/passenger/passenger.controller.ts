import { Request, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { IPassenger } from '@ayahay/models';
import { AuthGuard } from '@/guard/auth.guard';
import { AllowUnverified } from '@/decorator/verified.decorator';

@Controller('passengers')
@UseGuards(AuthGuard)
export class PassengerController {
  constructor(private passengerService: PassengerService) {}

  @Post()
  @AllowUnverified()
  async createPassengerForLoggedInAccount(
    @Request() req,
    @Body() passenger: IPassenger
  ): Promise<IPassenger> {
    passenger.account = req.user;
    return await this.passengerService.createPassenger(passenger);
  }
}
