import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { ACCOUNT_ROLE } from '@ayahay/constants';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
}
