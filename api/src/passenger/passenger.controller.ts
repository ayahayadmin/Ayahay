import { Controller } from '@nestjs/common';
import { PassengerService } from './passenger.service';

@Controller('passengers')
export class PassengerController {
  constructor(private passengerService: PassengerService) {}
}
