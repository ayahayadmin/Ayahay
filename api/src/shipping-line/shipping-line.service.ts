import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IShippingLine, IShippingLineSchedule, ITrip } from '@ayahay/models';
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
    shippingLineId: number
  ): Promise<IShippingLineSchedule[]> {
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
    createTripsFromSchedulesRequest: CreateTripsFromSchedulesRequest
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

    const trips: ITrip[] = [];
    for (const schedule of scheduleEntities) {
      for (const dateRange of createTripsFromSchedulesRequest.dateRanges) {
        const startDate = new Date(dateRange.startDateIso);
        const endDate = new Date(dateRange.endDateIso);
        for (
          let currentDate = startDate;
          currentDate <= endDate;
          currentDate.setDate(currentDate.getDate() + 1)
        ) {
          const tripToCreate =
            this.shippingLineMapper.convertScheduleToTrip(schedule);

          const departureDate = new Date(currentDate);
          departureDate.setHours(schedule.departureHour);
          departureDate.setMinutes(schedule.departureMinute);
          departureDate.setSeconds(0);
          departureDate.setMilliseconds(0);

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
