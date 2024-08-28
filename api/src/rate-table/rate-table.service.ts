import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAccount, IRateTable, IRateTableMarkup } from '@ayahay/models';
import { PrismaService } from '@/prisma.service';
import { RateTableMapper } from '@/rate-table/rate-table.mapper';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class RateTableService {
  private readonly DEFAULT_MARKUP_MAX_FLAT = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly rateTableMapper: RateTableMapper
  ) {}

  /**
   * used for booking in general
   */
  async getPublicRateTableById(id: number): Promise<IRateTable> {
    const rateTable = await this.prisma.rateTable.findUnique({
      where: { id },
      include: {
        rows: {
          include: {
            cabin: {
              include: {
                cabinType: true,
              },
            },
            vehicleType: true,
          },
          orderBy: {
            fare: 'asc',
          },
        },
      },
    });
    if (rateTable === null) {
      throw new NotFoundException();
    }

    return this.rateTableMapper.convertRateTableToPublicDto(rateTable);
  }

  async getRateTables(loggedInAccount: IAccount): Promise<IRateTable[]> {
    if (this.authService.isTravelAgencyAccount(loggedInAccount)) {
      return this.getRateTablesOfPartnerShippingLines(loggedInAccount);
    }

    const rateTables = await this.prisma.rateTable.findMany({
      where: {
        shippingLineId: loggedInAccount.shippingLineId,
      },
    });

    return rateTables.map((rateTable) =>
      this.rateTableMapper.convertRateTableSimpleDto(rateTable)
    );
  }

  async getRateTablesByShippingLineIdAndName(
    srcPortName: string,
    destPortName: string,
    shipName: string,
    loggedInAccount: IAccount
  ): Promise<IRateTable[]> {
    const rateTables = await this.prisma.rateTable.findMany({
      where: {
        shippingLineId:
          loggedInAccount.role === 'SuperAdmin'
            ? undefined
            : loggedInAccount.shippingLineId,
        OR: [
          {
            name: {
              contains: `${srcPortName} <-> ${destPortName} ${shipName} Rate Table`,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: `${destPortName} <-> ${srcPortName} ${shipName} Rate Table`,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    });

    return rateTables.map((rateTable) =>
      this.rateTableMapper.convertRateTableSimpleDto(rateTable)
    );
  }

  async getRateTablesOfPartnerShippingLines(
    loggedInAccount: IAccount
  ): Promise<IRateTable[]> {
    const partnerShippingLines =
      await this.prisma.travelAgencyShippingLine.findMany({
        where: {
          travelAgencyId: loggedInAccount.travelAgencyId,
        },
        select: {
          shippingLine: {
            select: {
              rateTables: true,
            },
          },
        },
      });

    const rateTables = partnerShippingLines
      .map(({ shippingLine }) => shippingLine.rateTables)
      .reduce((shippingLineARateTables, shippingLineBRateTables) => [
        ...shippingLineARateTables,
        ...shippingLineBRateTables,
      ]);
    return rateTables.map((rateTable) =>
      this.rateTableMapper.convertRateTableSimpleDto(rateTable)
    );
  }

  /**
   * Used to view all details (including private info such as markups)
   * of rate tables for administrative purposes (Admin)
   */
  async getFullRateTableById(
    id: number,
    loggedInAccount: IAccount
  ): Promise<IRateTable> {
    // don't show markup of other third-parties
    let markupWhere;
    if (this.authService.isTravelAgencyAccount(loggedInAccount)) {
      markupWhere = {
        travelAgencyId: loggedInAccount.travelAgencyId,
      };
    } else if (this.authService.isClientAccount(loggedInAccount)) {
      markupWhere = {
        clientId: loggedInAccount.clientId,
      };
    }
    const rateTable = await this.prisma.rateTable.findUnique({
      where: { id },
      include: {
        rows: {
          include: {
            cabin: {
              include: {
                cabinType: true,
              },
            },
            vehicleType: true,
          },
          orderBy: {
            fare: 'asc',
          },
        },
        markups: {
          where: markupWhere,
          include: {
            travelAgency: true,
            client: true,
          },
        },
      },
    });
    if (rateTable === null) {
      throw new NotFoundException();
    }

    await this.verifyRateTableAccess(rateTable, loggedInAccount);

    return this.rateTableMapper.convertRateTableToPrivilegedDto(rateTable);
  }

  async verifyRateTableAccess(
    rateTable: any,
    loggedInAccount: IAccount
  ): Promise<void> {
    if (this.authService.isThirdPartyAccount(loggedInAccount)) {
      await this.authService.verifyThirdPartyIsPartneredWithShippingLine(
        loggedInAccount,
        rateTable.shippingLineId
      );
    } else {
      this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
        rateTable,
        loggedInAccount
      );
    }
  }

  async createRateMarkup(
    markup: IRateTableMarkup,
    loggedInAccount: IAccount
  ): Promise<void> {
    const rateTable = await this.prisma.rateTable.findUnique({
      where: {
        id: markup.rateTableId,
      },
    });

    if (rateTable === null) {
      throw new NotFoundException();
    }

    await this.verifyRateTableAccess(rateTable, loggedInAccount);

    if (this.authService.isTravelAgencyAccount(loggedInAccount)) {
      markup.clientId = undefined;
      markup.markupMaxFlat = this.DEFAULT_MARKUP_MAX_FLAT;
    } else if (this.authService.isClientAccount(loggedInAccount)) {
      markup.travelAgencyId = undefined;
      markup.markupMaxFlat = this.DEFAULT_MARKUP_MAX_FLAT;
    } else if (this.authService.isShippingLineAccount(loggedInAccount)) {
      if (
        (markup.clientId === undefined &&
          markup.travelAgencyId === undefined) ||
        (markup.clientId !== undefined && markup.travelAgencyId !== undefined)
      ) {
        throw new BadRequestException(
          'Please select a third-party for this markup.'
        );
      }
      markup.markupFlat = 0;
      markup.markupPercent = 0;
    }

    await this.prisma.rateTableMarkup.create({
      data: this.rateTableMapper.convertRateTableMarkupToEntityForCreation(
        markup
      ),
    });
  }

  async updateRateMarkup(
    id: number,
    updatedMarkup: IRateTableMarkup,
    loggedInAccount: IAccount
  ): Promise<void> {
    const rateMarkup = await this.prisma.rateTableMarkup.findUnique({
      where: { id },
      include: { rateTable: true },
    });
    if (rateMarkup === null) {
      throw new NotFoundException();
    }
    await this.verifyRateTableAccess(rateMarkup.rateTable, loggedInAccount);

    let dataToUpdate = {};
    if (this.authService.isThirdPartyAccount(loggedInAccount)) {
      dataToUpdate = {
        markupFlat: updatedMarkup.markupFlat,
        markupPercent: updatedMarkup.markupPercent,
      };
    } else if (this.authService.isShippingLineAccount(loggedInAccount)) {
      dataToUpdate = {
        markupMaxFlat: updatedMarkup.markupMaxFlat,
      };
    }

    await this.prisma.rateTableMarkup.update({
      where: { id },
      data: dataToUpdate,
    });
  }
}
