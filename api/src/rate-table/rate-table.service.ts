import { Injectable, NotFoundException } from '@nestjs/common';
import { IRateTable } from '@ayahay/models';
import { PrismaService } from '@/prisma.service';
import { RateTableMapper } from '@/rate-table/rate-table.mapper';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class RateTableService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly rateTableMapper: RateTableMapper
  ) {}

  async getRateTableById(id: number): Promise<IRateTable> {
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
}
