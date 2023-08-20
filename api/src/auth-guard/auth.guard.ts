import {
  CanActivate,
  ExecutionContext,
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

  private matchRoles(requiredRoles: string[], role: string) {
    return includes(requiredRoles, role);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    const { email, uid } = await this.decryptToken(token)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw new UnauthorizedException();
      });

    let account = await this.getAccount(uid);

    if (!account) {
      account = await this.createAccount(uid, email);
    }

    const requiredRoles = this.reflector.getAllAndOverride<ACCOUNT_ROLE[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const accountRole = account.role;

    return this.matchRoles(requiredRoles, accountRole);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

//TO DO:
// - Might delete auth.controller, service, module?
