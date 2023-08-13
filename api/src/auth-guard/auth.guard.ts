import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { initFirebase } from 'src/utils/initFirebase';
import admin from 'firebase-admin';
import { ACCOUNT_API } from '@ayahay/constants';
import { IAccount } from '@ayahay/models';
import { includes } from 'lodash';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private decryptToken(token: string): Promise<string> {
    initFirebase();
    return admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        console.log(`uid: ${uid}`);
        return uid;
      })
      .catch((error) => {
        console.log(`error: ${error}`);
        throw new Error(error);
      });
  }

  private getAccount(token: string, uid: string) {
    return fetch(`${ACCOUNT_API}/${uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
  }

  //   private createAccount(token: string, )

  private matchRoles(roles: string[], role: string) {
    return includes(roles, role);
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { token } = request;

    const account: any = this.decryptToken(token)
      .then((res) => {
        return this.getAccount(token, res);
      })
      .catch((error) => {
        throw new UnauthorizedException();
      });

    if (!account) {
      // call create account
      // for now we assume we have account
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const accountRole = account.role;

    return this.matchRoles(roles, accountRole);
  }
}
