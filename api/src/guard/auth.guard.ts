import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { initFirebase } from 'src/utils/initFirebase';
import admin from 'firebase-admin';
import { IAccount } from '@ayahay/models';
import { includes } from 'lodash';
import { Request } from 'express';
import { ACCOUNT_ROLE } from '@ayahay/constants';
import { ROLES_KEY } from 'src/decorator/roles.decorator';
import { PrismaService } from 'src/prisma.service';
import { AUTHENTICATED_KEY } from '../decorator/authenticated.decorator';

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

  private decryptToken(token: string): Promise<any> {
    initFirebase();
    return admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        return decodedToken;
      })
      .catch((error) => {
        console.log(`error: ${error}`);
        throw new Error(error);
      });
  }

  private async getAccount(uid: string): Promise<IAccount> {
    return (await this.prisma.account.findUnique({
      where: {
        id: uid,
      },
    })) as IAccount;
  }

  private async createAccount(uid: string, email: string) {
    const requestBody = {
      id: uid,
      email,
      role: 'Passenger',
    };

    try {
      return (await this.prisma.account.create({
        data: requestBody,
      })) as IAccount;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const shouldBeAuthenticated =
      this.reflector.getAllAndOverride<boolean>(AUTHENTICATED_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? true;

    let isEmailVerified = false;
    let email = '';
    let uid = '';

    try {
      const {
        email: _email,
        uid: _uid,
        email_verified,
      } = await this.decryptToken(token);
      email = _email;
      uid = _uid;
      isEmailVerified = email_verified;
    } catch (e: any) {
      if (shouldBeAuthenticated === false) {
        return true;
      }
      throw new UnauthorizedException();
    }

    let account = await this.getAccount(uid);

    if (!account) {
      account = await this.createAccount(uid, email);
    }

    request['user'] = account;

    if (shouldBeAuthenticated === false) {
      return true;
    }

    if (!isEmailVerified) {
      throw new ForbiddenException('Unverified email');
    }

    const requiredRoles = this.reflector.getAllAndOverride<ACCOUNT_ROLE[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (requiredRoles && !includes(requiredRoles, account.role)) {
      throw new ForbiddenException('Insufficient access');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

//TO DO:
// - Might delete auth.controller, service, module?
