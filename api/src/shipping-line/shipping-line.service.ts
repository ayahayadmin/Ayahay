import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IAccount,
  IShippingLine,
  IShippingLineSchedule,
  ITrip,
} from '@ayahay/models';
import { CreateTripsFromSchedulesRequest } from '@ayahay/http';
import { ShippingLineMapper } from './shipping-line.mapper';
import { UtilityService } from '../utility.service';

@Injectable()
export class ShippingLineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingLineMapper: ShippingLineMapper,
    private readonly utilityService: UtilityService
  ) {}

  async getShippingLines(): Promise<IShippingLine[]> {
    return await this.prisma.shippingLine.findMany({});
  }

  async getSchedulesOfShippingLine(
    shippingLineId: number,
    loggedInAccount: IAccount
  ): Promise<IShippingLineSchedule[]> {
    this.utilityService.verifyLoggedInAccountHasAccessToShippingLineRestrictedEntity(
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
          rates: {
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
      });

    return shippingLineScheduleEntities.map((shippingLineScheduleEntity) =>
      this.shippingLineMapper.convertShippingLineScheduleToDto(
        shippingLineScheduleEntity
      )
    );
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
        rates: true,
      },
    });

    if (scheduleEntities.length !== scheduleIds.length) {
      throw new BadRequestException('One or more schedules is invalid');
    }

    scheduleEntities.forEach((schedule) =>
      this.utilityService.verifyLoggedInAccountHasAccessToShippingLineRestrictedEntity(
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

          tripToCreate.departureDateIso =
            tripToCreate.bookingCutOffDateIso =
            tripToCreate.bookingStartDateIso =
              departureDate.toISOString();

          tripToCreate.referenceNo =
            this.utilityService.generateRandomAlphanumericString(6);

          trips.push(tripToCreate);
        }
      }
    }

    return trips;
  }
}
