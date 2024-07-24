import { Controller } from '@nestjs/common';
import { SeatPlanService } from './seat-plan.service';

@Controller('seat-plans')
export class SeatPlanController {
  constructor(private seatPlanService: SeatPlanService) {}
}
