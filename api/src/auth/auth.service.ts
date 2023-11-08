import { Injectable, Logger } from '@nestjs/common';
import admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { initFirebase } from 'src/utils/initFirebase';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  public decryptToken({ token }): Promise<DecodedIdToken> {
    initFirebase();
    return admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => decodedToken)
      .catch((error) => {
        this.logger.error(`Decrypt token error: ${error}`);
        throw new Error(error);
      });
  }

  public async setUserClaims({ token, role }): Promise<void> {
    const claims = await admin.auth().verifyIdToken(token);

    // Verify user is eligible for additional privileges.
    if (typeof claims.email !== 'undefined') {
      await admin
        .auth()
        .setCustomUserClaims(claims.sub, { role })
        .catch((error) => {
          this.logger.error(`Set claims error: ${error}`);
          throw new Error(error);
        });
    } else {
      this.logger.error(`Ineligible to set claims`);
      throw new Error('Ineligible to set claims');
    }
  }

  public checkUserClaims(uid: string): Promise<{
    [key: string]: any;
  }> {
    return admin
      .auth()
      .getUser(uid)
      .then((userRecord) => userRecord.customClaims);
  }

  public async removeUserClaims(token: string): Promise<void> {
    const claims = await admin.auth().verifyIdToken(token);

    // Verify user is eligible for additional privileges.
    if (typeof claims.email !== 'undefined') {
      await admin
        .auth()
        .setCustomUserClaims(claims.sub, null)
        .catch((error) => {
          this.logger.error(`Remove claims error: ${error}`);
          throw new Error(error);
        });
    } else {
      this.logger.error(`Ineligible to remove claims`);
      throw new Error('Ineligible to remove claims');
    }
  }
}
