import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { Passenger, Prisma } from '@prisma/client';

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

  @Post()
  async createPassenger(@Body() data: Prisma.PassengerCreateInput) {
    try {
      return await this.passengerService.createPassenger(data);
    } catch {
      throw new BadRequestException();
    }
  }
}
