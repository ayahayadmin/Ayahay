import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { initFirebase } from 'src/utils/initFirebase';

@Injectable()
export class AuthService {
  public decryptToken({ token }): Promise<DecodedIdToken> {
    initFirebase();
    return admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => decodedToken)
      .catch((error) => {
        console.log(`error: ${error}`);
        throw new Error(error);
      });
  }
}
