import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import { initFirebase } from 'src/utils/initFirebase';

@Injectable()
export class AuthService {
  public decryptToken({ token }): Promise<string> {
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
}
