import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  decryptToken(@Body() body: { token: string }): Promise<DecodedIdToken> {
    return this.authService.decryptToken(body);
  }
}
