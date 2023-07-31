import { Injectable } from '@nestjs/common';
import { Port, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PortService {
  constructor(private prisma: PrismaService) {}
}
