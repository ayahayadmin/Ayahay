import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import admin from 'firebase-admin';
import { AccountMapper } from '@/account/account.mapper';
import { CryptoService } from '@/crypto/crypto.service';
import { UtilityService } from '@/utility.service';
import { IAccount } from '@ayahay/models';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly accountMapper: AccountMapper,
    private readonly cryptoService: CryptoService,
    private readonly utilityService: UtilityService,
    private readonly prisma: PrismaService
  ) {}

  async setUserClaims({ token, role, shippingLineId }): Promise<void> {
    const claims = await admin.auth().verifyIdToken(token);

    // Verify user is eligible for additional privileges.
    if (typeof claims.email !== 'undefined') {
      await admin
        .auth()
        .setCustomUserClaims(claims.sub, { role, shippingLineId })
        .catch((error) => {
          this.logger.error(`Set claims error: ${error}`);
          throw new Error(error);
        });
    } else {
      this.logger.error(`Ineligible to set claims`);
      throw new Error('Ineligible to set claims');
    }
  }

  checkUserClaims(uid: string): Promise<{
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

  async authenticate(request: any): Promise<IAccount> {
    const authorizationHeader = request?.headers?.authorization;
    if (!authorizationHeader) {
      throw new UnauthorizedException();
    }

    const [type, token] = authorizationHeader.split(' ') ?? [];
    switch (type) {
      case 'Bearer':
        request.token = token;
        return this.verifyJwt(token);
      case 'API-Key':
        return this.verifyApiKey(token);
    }

    throw new UnauthorizedException();
  }

  private async verifyJwt(token: string): Promise<IAccount> {
    const decoded = await admin.auth().verifyIdToken(token);
    return {
      id: decoded.uid,
      role: decoded.role,
      email: decoded.email,
      shippingLineId: decoded.shippingLineId,
      isEmailVerified: decoded.isEmailVerified,
    };
  }

  private async verifyApiKey(apiKey: string): Promise<IAccount> {
    const [signatureStr, accountId] = apiKey.split('__');
    await this.verifyApiKeyWithoutDb(signatureStr, accountId);

    const account = await this.prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });
    if (account?.apiKey !== apiKey) {
      throw new UnauthorizedException();
    }

    return this.accountMapper.convertAccountToDto(account);
  }

  async verifyApiKeyWithoutDb(
    signatureStr: string | undefined,
    accountId: string | undefined
  ): Promise<void> {
    if (!signatureStr || !accountId) {
      throw new UnauthorizedException();
    }
    const verified = await this.cryptoService.verifyAyahaySignature(
      Buffer.from(signatureStr, 'base64'),
      Buffer.from(accountId)
    );
    if (!verified) {
      throw new UnauthorizedException();
    }
  }
}
