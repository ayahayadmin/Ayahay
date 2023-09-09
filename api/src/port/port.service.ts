import { Injectable } from '@nestjs/common';
import { Port, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { IPort } from '@ayahay/models';

@Injectable()
export class PortService {
  constructor(private prisma: PrismaService) {}

  async getPorts(): Promise<IPort[]> {
    const ports = await this.prisma.port.findMany({});
    return ports;
  }
}
