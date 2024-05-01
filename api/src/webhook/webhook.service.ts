import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IAccount, IWebhook } from '@ayahay/models';
import { AuthService } from '@/auth/auth.service';
import { WebhookMapper } from '@/webhook/webhook.mapper';

@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly webhookMapper: WebhookMapper
  ) {}

  async getWebhooksByCompany(
    shippingLineId: number | undefined,
    travelAgencyId: number | undefined,
    loggedInAccount: IAccount
  ): Promise<IWebhook[]> {
    this.verifyAccessToWebhook(
      { shippingLineId, travelAgencyId },
      loggedInAccount
    );
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        shippingLineId: shippingLineId ?? null,
        travelAgencyId: travelAgencyId ?? null,
      },
    });
    return webhooks.map(this.webhookMapper.convertWebhookToDto);
  }

  private verifyAccessToWebhook(
    webhook: { shippingLineId?: number; travelAgencyId?: number },
    loggedInAccount
  ): void {
    const { shippingLineId, travelAgencyId } = webhook;
    if (shippingLineId) {
      this.authService.verifyLoggedInAccountHasAccessToShippingLineRestrictedEntity(
        { shippingLineId },
        loggedInAccount
      );
    }
    if (travelAgencyId) {
      this.authService.verifyLoggedInAccountHasAccessToTravelAgencyRestrictedEntity(
        { travelAgencyId },
        loggedInAccount
      );
    }
  }

  async registerWebhook(
    webhook: IWebhook,
    loggedInAccount: IAccount
  ): Promise<void> {
    this.verifyAccessToWebhook(webhook, loggedInAccount);
    const webhookEntity =
      this.webhookMapper.convertWebhookToEntityForCreation(webhook);
    await this.prisma.webhook.create(webhookEntity);
  }

  async updateWebhook(
    webhookId: number,
    url: string,
    loggedInAccount: IAccount
  ): Promise<void> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });
    this.verifyAccessToWebhook(webhook, loggedInAccount);
    this.validateWebhookUrl(url);

    await this.prisma.webhook.update({
      where: {
        id: webhookId,
      },
      data: {
        url,
      },
    });
  }

  private validateWebhookUrl(url: string): void {
    try {
      const newUrl = new URL(url);
      if (newUrl.protocol === 'http:' || newUrl.protocol === 'https:') {
        throw new BadRequestException('Invalid URL');
      }
    } catch {
      throw new BadRequestException('Invalid URL');
    }
  }

  async deregisterWebhook(
    webhookId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });
    this.verifyAccessToWebhook(webhook, loggedInAccount);
    await this.prisma.webhook.delete({
      where: {
        id: webhookId,
      },
    });
  }
}
