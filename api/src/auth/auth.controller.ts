import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  async decryptToken(@Body() body: { token: string }) {
    return await this.authService.decryptToken(body);
  }
}
