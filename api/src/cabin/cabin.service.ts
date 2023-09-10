import { Injectable } from '@nestjs/common';
import { Cabin, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CabinService {
  constructor(private prisma: PrismaService) {}
}
