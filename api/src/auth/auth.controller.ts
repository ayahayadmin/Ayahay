import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  decryptToken(@Body() body: { token: string }) {
    return this.authService.decryptToken(body);
  }
}
