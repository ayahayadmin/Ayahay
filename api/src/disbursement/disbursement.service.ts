import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IAccount, IDisbursement } from '@ayahay/models';
import { DisbursementMapper } from './disbursement.mapper';
import { Prisma } from '@prisma/client';
import { DisbursementsPerTeller, TripSearchByDateRange } from '@ayahay/http';

@Injectable()
export class DisbursementService {
  constructor(
    private prisma: PrismaService,
    private readonly disbursementMapper: DisbursementMapper
  ) {}

  async getDisbursementsByTrip(
    tripId: number,
    loggedInAccount: IAccount
  ): Promise<IDisbursement[]> {
    const disbursements = await this.prisma.disbursement.findMany({
      where: {
        tripId: Number(tripId),
        trip: {
          shippingLineId: loggedInAccount.shippingLineId,
        },
      },
      include: {
        trip: {
          select: {
            shippingLineId: true,
          },
        },
      },
    });

    return disbursements.map((disbursement) =>
      this.disbursementMapper.convertDisbursementToDto(disbursement)
    );
  }

  async getDisbursementsByAccount(
    { startDate, endDate }: TripSearchByDateRange,
    loggedInAccount: IAccount
  ): Promise<DisbursementsPerTeller[]> {
    const disbursements = await this.prisma.disbursement.findMany({
      where: {
        createdByAccountId: loggedInAccount.id,
        createdAt: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        trip: {
          shippingLineId: loggedInAccount.shippingLineId,
        },
      },
      select: {
        amount: true,
        date: true,
        description: true,
        officialReceipt: true,
        paidTo: true,
        purpose: true,
        trip: {
          select: {
            id: true,
            srcPort: {
              select: {
                code: true,
              },
            },
            destPort: {
              select: {
                code: true,
              },
            },
            departureDate: true,
          },
        },
      },
    });

    return disbursements.map((disbursement) =>
      this.disbursementMapper.convertDisbursementToDisbursementsPerTeller(
        disbursement
      )
    );
  }

  async createDisbursements(
    disbursementData: Prisma.DisbursementCreateManyInput[],
    loggedInAccount: IAccount
  ): Promise<void> {
    const disbursementDataWithCreateInfo = disbursementData.map((data) => ({
      ...data,
      createdByAccountId: loggedInAccount.id,
      createdAt: new Date(),
    }));

    await this.prisma.disbursement.createMany({
      data: disbursementDataWithCreateInfo,
    });
  }
}
