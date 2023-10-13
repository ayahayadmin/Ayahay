import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IShip } from '@ayahay/models';

@Injectable()
export class ShipService {
  constructor(private prisma: PrismaService) {}

  async getShips(): Promise<IShip[]> {
    return await this.prisma.ship.findMany({});
  }
}
