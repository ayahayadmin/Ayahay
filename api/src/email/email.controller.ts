import { Controller, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthGuard } from '@/guard/auth.guard';
import { Roles } from '@/decorator/roles.decorator';

@Controller('email')
@UseGuards(AuthGuard)
@Roles('Staff', 'Admin', 'SuperAdmin')
export class EmailController {
  constructor(private emailService: EmailService) {}
}
