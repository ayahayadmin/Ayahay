import { Request, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { IPassenger } from '@ayahay/models';
import { AuthGuard } from '@/auth/auth.guard';
import { AllowUnverified } from '@/decorator/verified.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('passengers')
@UseGuards(AuthGuard)
@ApiExcludeController()
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
