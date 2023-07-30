import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { Passenger } from '@prisma/client';

@Controller('passenger')
export class PassengerController {
  constructor(private passengerService: PassengerService) {}

  @Get(':userId')
  async getPassengerByUserId(
    @Param('userId') userId: string
  ): Promise<Passenger> {
    const passenger = await this.passengerService.getPassengerByUserId({
      userId,
    });
    if (!passenger) {
      throw new NotFoundException('Passenger Not Found');
    }

    return passenger;
  }
}
