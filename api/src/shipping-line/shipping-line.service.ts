import { Injectable } from '@nestjs/common';
import { ShippingLine, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ShippingLineService {
  constructor(private prisma: PrismaService) {}
}
