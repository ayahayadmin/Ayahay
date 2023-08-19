import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { initFirebase } from 'src/utils/initFirebase';
import admin from 'firebase-admin';
import { IAccount } from '@ayahay/models';
import { includes } from 'lodash';
import { Request } from 'express';
import axios from 'axios';
import { ACCOUNT_ROLE } from '@ayahay/constants';
import { ROLES_KEY } from 'src/decorators/roles.decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

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

  private async getAccount(token: string, uid: string): Promise<IAccount> {
    const config = { headers: { Authorization: `Bearer ${token}` } };

    return await axios
      .get(`http://localhost:3001/accounts/${uid}`, config)
      .then(({ data }) => {
        return data;
      })
      .catch((error) => {
        console.error('Axios Error getAccount', error.message);
      });
  }

  private async createAccount(token: string, uid: string, email: string) {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const requestBody = {
      id: uid,
      email,
      role: 'Passenger',
    };

    return await axios
      .post(`http://localhost:3001/accounts`, requestBody, config)
      .then(({ data }) => {
        return data;
      })
      .catch((error) => {
        console.error('Axios Error createAccount', error.message);
      });
  }

  private matchRoles(requiredRoles: string[], role: string) {
    return includes(requiredRoles, role);
  }

  async canActivate(context: ExecutionContext) {
    //boolean | Promise<boolean> | Observable<boolean>
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    const { email, uid } = await this.decryptToken(token)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw new UnauthorizedException();
      });

    let account = await this.getAccount(token, uid);

    if (!account) {
      account = await this.createAccount(token, uid, email);
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
