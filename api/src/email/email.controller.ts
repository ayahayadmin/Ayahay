import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthGuard } from 'src/guard/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';

@Controller('email')
@UseGuards(AuthGuard)
@Roles('Staff', 'Admin', 'SuperAdmin')
export class EmailController {
  constructor(private emailService: EmailService) {}
}
