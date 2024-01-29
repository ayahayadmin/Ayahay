import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { IDisbursement } from '@ayahay/models';
import { DisbursementMapper } from './disbursement.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class DisbursementService {
  constructor(
    private prisma: PrismaService,
    private readonly disbursementMapper: DisbursementMapper
  ) {}

  async getDisbursements({ tripId }): Promise<IDisbursement[]> {
    const disbursements = await this.prisma.disbursement.findMany({
      where: {
        tripId: Number(tripId),
      },
    });
    return disbursements.map((disbursement) =>
      this.disbursementMapper.convertDisbursementToDto(disbursement)
    );
  }

  async createDisbursements(
    disbursementData: Prisma.DisbursementCreateManyInput[]
  ): Promise<void> {
    await this.prisma.disbursement.createMany({
      data: disbursementData,
    });
  }
}
