import { Injectable } from '@nestjs/common';
import { ShippingLine, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { IShippingLine } from '@ayahay/models';

@Injectable()
export class ShippingLineService {
  constructor(private prisma: PrismaService) {}

  async getShippingLines(): Promise<IShippingLine[]> {
    return await this.prisma.shippingLine.findMany({});
  }
}
