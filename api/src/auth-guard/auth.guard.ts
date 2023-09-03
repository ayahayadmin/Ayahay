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
import { ROLES_KEY } from 'src/decorators/roles.decorators';
import { PrismaService } from 'src/prisma.service';

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
      console.error(e);
      throw new UnauthorizedException();
    }

    if (!isEmailVerified) {
      throw new ForbiddenException('Unverified email');
    }

    let account = await this.getAccount(uid);

    if (!account) {
      account = await this.createAccount(uid, email);
    }

    const requiredRoles = this.reflector.getAllAndOverride<ACCOUNT_ROLE[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    request['user'] = account;

    if (!requiredRoles) {
      return true;
    }

    const accountRole = account.role;

    if (includes(requiredRoles, accountRole)) {
      return true;
    }

    throw new ForbiddenException('Insufficient access');
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

//TO DO:
// - Might delete auth.controller, service, module?
