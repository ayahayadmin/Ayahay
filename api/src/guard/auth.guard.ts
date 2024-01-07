import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import admin from 'firebase-admin';
import { includes } from 'lodash';
import { Request } from 'express';
import { ACCOUNT_ROLE } from '@ayahay/constants';
import { ROLES_KEY } from 'src/decorator/roles.decorator';
import { PrismaService } from 'src/prisma.service';
import { AUTHENTICATED_KEY } from '../decorator/authenticated.decorator';
import { VERIFIED_KEY } from 'src/decorator/verified.decorator';

/**
 * Sets request.user to the logged-in account making the request
 *
 * If the request does not have a valid Authorization token, then we
 * return a 401 Unauthorized response.
 *
 * If the request has a valid Authorization token but the email
 * associated with the account is not verified, then we return
 * a 403 Forbidden response.
 *
 * At this point, by default we allow the request, but if the
 * endpoint/method has a @Roles decorator, then we verify that
 * the role of the logged-in account is any of the roles provided
 * the decorator.
 *
 * If the endpoint/method has a @AllowUnauthenticated decorator,
 * we will not return a 401 or a 403 response. If the request has a
 * valid Authorization token, then we just set the request.user
 * to the logged-in account. In any other scenario, we allow the
 * request.
 **/
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  private readonly logger = new Logger(AuthGuard.name);

  private decryptToken(token: string): Promise<any> {
    return admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => decodedToken)
      .catch((error) => {
        this.logger.error(`Decrypt token failed: ${error}`);
        throw new Error(error);
      });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const shouldBeAuthenticated =
      this.reflector.getAllAndOverride<boolean>(AUTHENTICATED_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? true;
    const shouldBeVerified =
      this.reflector.getAllAndOverride<boolean>(VERIFIED_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? true;

    let isEmailVerified = false;
    let email = '';
    let uid = '';
    let role = '';
    let shippingLineId = undefined;

    try {
      const {
        email: _email,
        uid: _uid,
        email_verified,
        role: _role,
        shippingLineId: _shippingLineId,
      } = await this.decryptToken(token);
      email = _email;
      uid = _uid;
      isEmailVerified = email_verified;
      role = _role;
      shippingLineId = _shippingLineId;
    } catch (e: any) {
      if (shouldBeAuthenticated === false) {
        return true;
      }
      throw new UnauthorizedException();
    }

    request['user'] = {
      id: uid,
      role,
      email,
      token,
      shippingLineId,
    };

    if (shouldBeAuthenticated === false) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<ACCOUNT_ROLE[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (requiredRoles && !includes(requiredRoles, role)) {
      throw new ForbiddenException('Insufficient access');
    }

    if (shouldBeVerified === false) {
      return true;
    }

    if (role === 'Passenger' && !isEmailVerified) {
      throw new ForbiddenException('Unverified email');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
