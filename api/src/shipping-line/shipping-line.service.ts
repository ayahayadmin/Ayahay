import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import {
  IAccount,
  IPort,
  IShippingLine,
  IShippingLineSchedule,
  ITrip,
} from '@ayahay/models';
import { CreateTripsFromSchedulesRequest } from '@ayahay/http';
import { ShippingLineMapper } from './shipping-line.mapper';
import { UtilityService } from '@/utility.service';
import { AuthService } from '@/auth/auth.service';
import { PortMapper } from '@/port/port.mapper';

@Injectable()
export class ShippingLineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingLineMapper: ShippingLineMapper,
    private readonly portMapper: PortMapper,
    private readonly utilityService: UtilityService,
    private readonly authService: AuthService
  ) {}

  async getShippingLines(): Promise<IShippingLine[]> {
    const shippingLines = await this.prisma.shippingLine.findMany({
      include: {
        seatTypes: true,
      },
    });
    return shippingLines.map((shippingLine) =>
      this.shippingLineMapper.convertShippingLineToFullDto(shippingLine)
    );
  }

  async getSchedulesOfShippingLine(
    shippingLineId: number,
    loggedInAccount: IAccount
  ): Promise<IShippingLineSchedule[]> {
    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      { shippingLineId },
      loggedInAccount
    );
    const shippingLineScheduleEntities =
      await this.prisma.shippingLineSchedule.findMany({
        where: {
          shippingLineId,
        },
        include: {
          srcPort: true,
          destPort: true,
          ship: {
            include: {
              cabins: {
                include: {
                  cabinType: true,
                },
              },
            },
          },
          rateTable: {
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
              },
            },
          },
        },
      });

    return shippingLineScheduleEntities.map((shippingLineScheduleEntity) =>
      this.shippingLineMapper.convertShippingLineScheduleToDto(
        shippingLineScheduleEntity
      )
    );
  }

  async getPortsByShippingLine(shippingLineId: number): Promise<IPort[]> {
    const ports = await this.prisma.shippingLinePort.findMany({
      where: { shippingLineId },
      include: { port: true },
    });

    return ports.map(({ port }) => this.portMapper.convertPortToDto(port));
  }

  async convertSchedulesToTrips(
    createTripsFromSchedulesRequest: CreateTripsFromSchedulesRequest,
    loggedInAccount: IAccount
  ): Promise<ITrip[]> {
    const scheduleIds = createTripsFromSchedulesRequest.schedules.map(
      (schedule) => schedule.scheduleId
    );
    const scheduleEntities = await this.prisma.shippingLineSchedule.findMany({
      where: {
        id: {
          in: scheduleIds,
        },
      },
      include: {
        ship: {
          include: {
            cabins: true,
          },
        },
        rateTable: {
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
            },
          },
        },
      },
    });

    if (scheduleEntities.length !== scheduleIds.length) {
      throw new BadRequestException('One or more schedules is invalid');
    }

    scheduleEntities.forEach((schedule) =>
      this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
        schedule,
        loggedInAccount
      )
    );

    const trips: ITrip[] = [];
    for (const schedule of scheduleEntities) {
      for (const dateRange of createTripsFromSchedulesRequest.dateRanges) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        for (
          let currentDate = startDate;
          currentDate <= endDate;
          currentDate.setDate(currentDate.getDate() + 1)
        ) {
          const tripToCreate =
            this.shippingLineMapper.convertScheduleToTrip(schedule);

          const yyyyYear = currentDate.getFullYear();
          const mmMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
          const ddDay = String(currentDate.getDate()).padStart(2, '0');
          const hhHour = String(schedule.departureHour).padStart(2, '0');
          const mmMinute = String(schedule.departureMinute).padStart(2, '0');
          const hhMmTimezone = '+08:00';
          const departureDate = new Date(
            `${yyyyYear}-${mmMonth}-${ddDay}T${hhHour}:${mmMinute}:00.000${hhMmTimezone}`
          );

          tripToCreate.departureDateIso = tripToCreate.bookingStartDateIso =
            departureDate.toISOString();

          // Deduct 2hrs for booking cut-off date
          departureDate.setHours(departureDate.getHours() - 2);

          tripToCreate.bookingCutOffDateIso = departureDate.toISOString();

          tripToCreate.referenceNo =
            this.utilityService.generateRandomAlphanumericString(6);

          trips.push(tripToCreate);
        }
      }
    }

    return trips;
  }
}
