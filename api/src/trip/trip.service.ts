import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient, Trip } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import { IAccount, ITrip } from '@ayahay/models';
import { TripMapper } from './trip.mapper';
import { isEmpty } from 'lodash';
import {
  AvailableTrips,
  CancelledTrips,
  CollectOption,
  CreateTripsFromSchedulesRequest,
  PaginatedRequest,
  PaginatedResponse,
  PortsAndDateRangeSearch,
  SearchAvailableTrips,
  UpdateTripCapacityRequest,
  VehicleBookings,
} from '@ayahay/http';
import { TripValidator } from './trip.validator';
import { ShippingLineService } from '@/shipping-line/shipping-line.service';
import { ShipService } from '@/ship/ship.service';
import { UtilityService } from '@/utility.service';
import { EmailService } from '@/email/email.service';
import { BookingMapper } from '@/booking/booking.mapper';
import { AuthService } from '@/auth/auth.service';

const TRIP_AVAILABLE_QUERY_SELECT = Prisma.sql`
  SELECT 
    t.id, 
    MAX(t.departure_date) AS "departureDate",
    t.reference_number AS "referenceNo",
    t.ship_id AS "shipId",
    t.shipping_line_id AS "shippingLineId",
    t.src_port_id AS "srcPortId",
    t.dest_port_id AS "destPortId",
    t.status AS "status",
    t.seat_selection AS "seatSelection",
    t.available_vehicle_capacity AS "availableVehicleCapacity",
    t.vehicle_capacity AS "vehicleCapacity",
    t.booking_start_date AS "bookingStartDate",
    t.booking_cut_off_date AS "bookingCutOffDate",
    STRING_AGG(tc.cabin_id::TEXT, '|') AS "pipeSeparatedCabinIds",
    STRING_AGG(rtr.fare::TEXT, '|') AS "pipeSeparatedCabinFares",
    STRING_AGG(tc.available_passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinAvailableCapacities",
    STRING_AGG(tc.passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinCapacities",
    STRING_AGG(c.cabin_type_id::TEXT, '|') AS "pipeSeparatedCabinTypeIds",
    STRING_AGG(c.name::TEXT, '|') AS "pipeSeparatedCabinNames",
    STRING_AGG(c.recommended_passenger_capacity::TEXT, '|') AS "pipeSeparatedRecommendedCabinCapacities",
    STRING_AGG(ct.name::TEXT, '|') AS "pipeSeparatedCabinTypeNames",
    STRING_AGG(ct.description::TEXT, '|') AS "pipeSeparatedCabinTypeDescriptions"
`;

const TRIP_AVAILABLE_QUERY_FROM = Prisma.sql`
  FROM ayahay.trip t
    INNER JOIN ayahay.trip_cabin tc ON t.id = tc.trip_id
    INNER JOIN ayahay.cabin c ON tc.cabin_id = c.id
    INNER JOIN ayahay.cabin_type ct ON c.cabin_type_id = ct.id
    INNER JOIN ayahay.rate_table_row rtr ON t.rate_table_id = rtr.rate_table_id AND tc.cabin_id = rtr.cabin_id
`;

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingLineService: ShippingLineService,
    private readonly shipService: ShipService,
    private readonly emailService: EmailService,
    private readonly utilityService: UtilityService,
    private readonly authService: AuthService,
    private readonly tripMapper: TripMapper,
    private readonly bookingMapper: BookingMapper,
    private readonly tripValidator: TripValidator
  ) {}

  async getTrips(): Promise<ITrip[]> {
    const trips = await this.prisma.trip.findMany({
      include: {
        srcPort: true,
        destPort: true,
        shippingLine: true,
        ship: {
          include: {
            cabins: {
              include: {
                cabinType: true,
              },
            },
          },
        },
      },
    });
    if (!trips) {
      throw new NotFoundException('Trip Not Found');
    }

    return trips.map((trip) => this.tripMapper.convertTripToBasicDto(trip));
  }

  async getTrip(
    loggedInAccount: IAccount,
    tripWhereUniqueInput: Prisma.TripWhereUniqueInput,
    tripIncludeInput?: Prisma.TripInclude
  ): Promise<Trip> {
    const trip = await this.prisma.trip.findUnique({
      where: tripWhereUniqueInput,
      include: tripIncludeInput,
    });

    if (!trip) {
      throw new NotFoundException('Trip Not Found');
    }

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      trip,
      loggedInAccount
    );

    return trip;
  }

  async getAvailableTrips(query: SearchAvailableTrips): Promise<ITrip[]> {
    const {
      srcPortId,
      destPortId,
      departureDate,
      passengerCount,
      vehicleCount,
      cabinIds,
    } = query;

    const dateSelectedPlusAWeek = new Date(departureDate);
    dateSelectedPlusAWeek.setDate(dateSelectedPlusAWeek.getDate() + 7);

    const trips = await this.prisma.$queryRaw<AvailableTrips[]>`
      ${TRIP_AVAILABLE_QUERY_SELECT}
      ${TRIP_AVAILABLE_QUERY_FROM}
      WHERE t.available_vehicle_capacity >= ${Number(vehicleCount)}
        AND t.departure_date > ${departureDate}::TIMESTAMP
        AND t.departure_date <= ${dateSelectedPlusAWeek.toISOString()}::DATE + 1 - interval '1 sec'
        AND t.src_port_id = ${Number(srcPortId)}
        AND t.dest_port_id = ${Number(destPortId)}
        AND t.status = 'Awaiting'
        AND t.rate_table_id = rtr.rate_table_id
        ${
          isEmpty(cabinIds)
            ? Prisma.empty
            : Prisma.sql`AND c.cabin_type_id IN (${Prisma.join(
                cabinIds.split(',').map((id) => Number(id))
              )})`
        }
      GROUP BY t.id
      HAVING SUM(tc.available_passenger_capacity) >= ${Number(passengerCount)}
      ORDER BY t.departure_date ASC
    `;

    return trips.map((trip) =>
      this.tripMapper.convertAvailableTripsToDto(trip)
    );
  }

  async getTripsByIds(tripIds: number[]): Promise<ITrip[]> {
    if (!tripIds || tripIds.length === 0 || tripIds.length > 10) {
      throw new BadRequestException();
    }
    const trips = await this.prisma.trip.findMany({
      where: {
        id: {
          in: tripIds,
        },
      },
      include: {
        srcPort: true,
        destPort: true,
        shippingLine: true,
        availableCabins: {
          include: {
            cabin: {
              include: {
                cabinType: true,
              },
            },
          },
        },
      },
    });

    return trips.map((trip) => this.tripMapper.convertTripToDto(trip));
  }

  async getFullTripsById(tripIds: number[]): Promise<ITrip[]> {
    if (!tripIds || tripIds.length === 0 || tripIds.length > 10) {
      throw new BadRequestException();
    }
    const trips = await this.prisma.trip.findMany({
      where: {
        id: {
          in: tripIds,
        },
      },
      include: {
        srcPort: true,
        destPort: true,
        shippingLine: true,
        availableCabins: {
          include: {
            cabin: {
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
            markups: true,
          },
        },
      },
    });

    return trips.map((trip) => this.tripMapper.convertFullTripToDto(trip));
  }

  async getAvailableTripsByDateRange(
    pagination: PaginatedRequest,
    shippingLineId: number,
    startDate: string,
    endDate: string,
    srcPortId?: number,
    destPortId?: number
  ): Promise<PaginatedResponse<ITrip>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;
    const where = Prisma.sql`
      WHERE t.shipping_line_id = ${Number(shippingLineId)}
      AND t.departure_date > ${startDate}::TIMESTAMP
      AND t.departure_date <= ${endDate}::TIMESTAMP
      ${
        !!srcPortId
          ? Prisma.sql`AND t.src_port_id = ${srcPortId}`
          : Prisma.empty
      }
      ${
        !!destPortId
          ? Prisma.sql`AND t.dest_port_id = ${destPortId}`
          : Prisma.empty
      }
    `;

    const trips = await this.prisma.$queryRaw<AvailableTrips[]>`
      ${TRIP_AVAILABLE_QUERY_SELECT}
      ${TRIP_AVAILABLE_QUERY_FROM}
      ${where}
 	    GROUP BY t.id
      ORDER BY t.departure_date ASC
      OFFSET ${skip}
      LIMIT ${itemsPerPage};
    `;

    const tripsCount = await this.prisma.$queryRaw<number>`
      SELECT 
        COUNT(t.id)::integer
      ${TRIP_AVAILABLE_QUERY_FROM}
      ${where}
    `;

    return {
      total: tripsCount[0].count,
      data: trips.map((trip) =>
        this.tripMapper.convertAvailableTripsToDto(trip)
      ),
    };
  }

  async getTripsForCollectBooking(
    { startDate, endDate, srcPortId, destPortId }: PortsAndDateRangeSearch,
    loggedInAccount: IAccount
  ): Promise<CollectOption[]> {
    const trips = await this.prisma.trip.findMany({
      where: {
        departureDate: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
        shippingLineId: loggedInAccount.shippingLineId,
        srcPortId: Number(srcPortId) || undefined,
        destPortId: Number(destPortId) || undefined,
      },
      select: {
        id: true,
        srcPort: {
          select: {
            name: true,
          },
        },
        destPort: {
          select: {
            name: true,
          },
        },
        departureDate: true,
      },
      orderBy: {
        departureDate: 'asc',
      },
    });

    return this.tripMapper.convertTripToCollectOptions(trips);
  }

  async getCancelledTrips(
    pagination: PaginatedRequest,
    shippingLineId: number,
    { startDate, endDate, srcPortId, destPortId }: PortsAndDateRangeSearch,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<CancelledTrips>> {
    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      { shippingLineId },
      loggedInAccount
    );

    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const where: Prisma.TripWhereInput = {
      shippingLineId,
      departureDate: {
        gte: new Date(startDate).toISOString(),
        lte: new Date(endDate).toISOString(),
      },
      status: 'Cancelled',
      srcPortId: Number(srcPortId) || undefined,
      destPortId: Number(destPortId) || undefined,
    };

    const cancelledTrips = await this.prisma.trip.findMany({
      where,
      select: {
        srcPort: {
          select: {
            name: true,
          },
        },
        destPort: {
          select: {
            name: true,
          },
        },
        ship: {
          select: {
            name: true,
          },
        },
        departureDate: true,
        cancellationReason: true,
      },
      take: itemsPerPage,
      skip,
    });

    const cancelledTripsCount = await this.prisma.trip.count({
      where,
    });

    return {
      total: cancelledTripsCount,
      data: cancelledTrips.map((trip) =>
        this.tripMapper.convertCancelledTripsToDto(trip)
      ),
    };
  }

  async getBookingsOfTrip(
    pagination: PaginatedRequest,
    tripId: number,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<VehicleBookings>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const bookingIds = await this.prisma.bookingTripVehicle.findMany({
      where: {
        tripId,
        trip: {
          shippingLineId: loggedInAccount.shippingLineId,
        },
      },
      select: {
        bookingId: true,
        trip: {
          select: {
            shippingLineId: true,
          },
        },
      },
    });

    const bookingIdsStrArr = bookingIds.map(({ bookingId }) => bookingId);

    const where: Prisma.BookingWhereInput = {
      id: {
        in: bookingIdsStrArr,
      },
      bookingStatus: {
        in: ['Confirmed', 'Requested'],
      },
    };

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        bookingTripVehicles: {
          where: {
            removedReason: null,
          },
          include: {
            vehicle: {
              include: {
                vehicleType: true,
              },
            },
          },
        },
      },
      take: itemsPerPage,
      skip,
    });

    const bookingsCount = await this.prisma.booking.count({
      where,
    });

    return {
      total: bookingsCount,
      data: bookings.map((booking) =>
        this.bookingMapper.convertBookingToBookingTripVehicle(booking)
      ),
    };
  }

  async createTrip(data: Prisma.TripCreateInput): Promise<Trip> {
    const REQUIRED_FIELDS = [
      'id',
      'shipId',
      'destPortId',
      'srcPortId',
      'baseFare',
      'departureDate',
      'shippingLineId',
      'referenceNo',
    ];

    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !data.hasOwnProperty(field)
    );

    if (missingFields.length) {
      throw new BadRequestException(
        `The following fields are required: ${missingFields.join(', ')}`
      );
    }

    try {
      return await this.prisma.trip.create({
        data,
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async createTripsFromSchedules(
    createTripsFromSchedulesRequest: CreateTripsFromSchedulesRequest,
    loggedInAccount: IAccount
  ): Promise<void> {
    const tripsToCreate =
      await this.shippingLineService.convertSchedulesToTrips(
        createTripsFromSchedulesRequest,
        loggedInAccount
      );

    const tripReferenceNos: string[] = [];
    const tripEntities: Prisma.TripCreateManyInput[] = [];
    const tripCabinsPerTrip: {
      [referenceNo: string]: Prisma.TripCabinCreateManyInput[];
    } = {};

    for (const trip of tripsToCreate) {
      const referenceNo = trip.referenceNo;
      // TODO: handle the unlikely scenario when referenceNo is repeated twice

      tripReferenceNos.push(referenceNo);
      tripEntities.push(this.tripMapper.convertTripToEntityForCreation(trip));
      tripCabinsPerTrip[referenceNo] = trip.availableCabins.map((tripCabin) =>
        this.tripMapper.convertTripCabinToEntityForCreation(tripCabin)
      );
    }

    try {
      await this.prisma.$transaction(async (transactionContext) => {
        await transactionContext.trip.createMany({
          data: tripEntities,
        });

        const tripCabinEntities: Prisma.TripCabinCreateManyInput[] = [];

        const createdTripEntities = await transactionContext.trip.findMany({
          where: {
            referenceNo: {
              in: tripReferenceNos,
            },
            departureDate: {
              gt: new Date(),
            },
          },
        });

        for (const createdTripEntity of createdTripEntities) {
          const tripCabinsOfTrip =
            tripCabinsPerTrip[createdTripEntity.referenceNo];

          for (const tripCabin of tripCabinsOfTrip) {
            tripCabin.tripId = createdTripEntity.id;
            tripCabinEntities.push(tripCabin);
          }
        }

        await transactionContext.tripCabin.createMany({
          data: tripCabinEntities,
        });
      });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
        throw e;
      }

      if (e.code === 'P2002') {
        throw new BadRequestException(
          'One or more trips in the specified date range already exist.'
        );
      }

      throw e;
    }
  }

  async updateTripCapacities(
    tripId: number,
    updateTripCapacityRequest: UpdateTripCapacityRequest,
    loggedInAccount: IAccount
  ): Promise<void> {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        availableCabins: true,
      },
    });

    if (trip === null) {
      throw new NotFoundException();
    }

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      trip,
      loggedInAccount
    );

    const errors = await this.tripValidator.validateUpdateTripCapacityRequest(
      trip,
      updateTripCapacityRequest
    );

    if (errors !== undefined) {
      throw new BadRequestException(errors);
    }

    await this.prisma.$transaction(async (transactionContext) => {
      await this.updateTripVehicleCapacity(
        trip,
        updateTripCapacityRequest.vehicleCapacity,
        transactionContext as any
      );
      await this.updateTripCabinCapacities(
        trip,
        updateTripCapacityRequest.cabinCapacities,
        transactionContext as any
      );
    });
  }

  private async updateTripVehicleCapacity(
    trip: any,
    newVehicleCapacity: number,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    if (trip.vehicleCapacity === newVehicleCapacity) {
      return;
    }

    const capacityDifference = newVehicleCapacity - trip.vehicleCapacity;

    await transactionContext.trip.update({
      where: {
        id: trip.id,
      },
      data: {
        vehicleCapacity: newVehicleCapacity,
        availableVehicleCapacity:
          trip.availableVehicleCapacity + capacityDifference,
      },
    });
  }

  private async updateTripCabinCapacities(
    trip: any,
    newCabinCapacities: { cabinId: number; passengerCapacity: number }[],
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;

    const cabinCapacitiesToUpdate: {
      cabinId: number;
      passengerCapacity: number;
    }[] = [];

    // get cabin capacities that has changes
    for (const cabinCapacity of newCabinCapacities) {
      const { cabinId, passengerCapacity } = cabinCapacity;

      const tripCabin = trip.availableCabins.find(
        (tripCabin) => tripCabin.cabinId === Number(cabinId)
      );

      if (tripCabin.passengerCapacity !== passengerCapacity) {
        cabinCapacitiesToUpdate.push(cabinCapacity);
      }
    }

    for (const cabinCapacity of cabinCapacitiesToUpdate) {
      const { cabinId, passengerCapacity: newPassengerCapacity } =
        cabinCapacity;

      const { availablePassengerCapacity, passengerCapacity } =
        trip.availableCabins.find(
          (tripCabin) => tripCabin.cabinId === Number(cabinId)
        );

      const capacityDifference = newPassengerCapacity - passengerCapacity;

      await transactionContext.tripCabin.update({
        where: {
          tripId_cabinId: {
            tripId: trip.id,
            cabinId: Number(cabinId),
          },
        },
        data: {
          passengerCapacity: newPassengerCapacity,
          availablePassengerCapacity:
            availablePassengerCapacity + capacityDifference,
        },
      });
    }
  }

  async setTripAsArrived(
    tripId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const tripToUpdate = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        srcPort: true,
        destPort: true,
      },
    });

    if (tripToUpdate === null) {
      throw new NotFoundException();
    }

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      tripToUpdate,
      loggedInAccount
    );

    if (tripToUpdate.status !== 'Awaiting') {
      throw new BadRequestException(
        'Cannot set a cancelled or arrived trip as arrived.'
      );
    }

    await this.prisma.$transaction(async (transactionContext) => {
      await transactionContext.trip.update({
        where: {
          id: tripId,
        },
        data: {
          status: 'Arrived',
        },
      });

      await this.shipService.createVoyageForTrip(
        tripToUpdate,
        transactionContext as any
      );
    });
  }

  async cancelTrip(
    tripId: number,
    reason: string,
    loggedInAccount: IAccount
  ): Promise<void> {
    const tripToUpdate = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        bookingTrips: true,
      },
    });

    if (tripToUpdate === null) {
      throw new NotFoundException();
    }

    this.authService.verifyAccountHasAccessToShippingLineRestrictedEntity(
      tripToUpdate,
      loggedInAccount
    );

    if (tripToUpdate.status !== 'Awaiting') {
      throw new BadRequestException(
        'Cannot cancel a cancelled or arrived trip'
      );
    }

    const bookingIdsToVoid = tripToUpdate.bookingTrips.map(
      ({ bookingId }) => bookingId
    );

    await this.prisma.$transaction(async (transactionContext) => {
      await transactionContext.trip.update({
        where: {
          id: tripId,
        },
        data: {
          status: 'Cancelled',
          cancellationReason: reason,
        },
      });

      if (bookingIdsToVoid.length > 0) {
        await transactionContext.booking.updateMany({
          where: {
            id: {
              in: bookingIdsToVoid,
            },
          },
          data: {
            bookingStatus: 'Cancelled',
            failureCancellationRemarks: 'Trip Cancelled',
          },
        });
      }

      this.emailService.prepareTripCancelledEmail(
        { tripId, reason },
      );
    });
  }
}
