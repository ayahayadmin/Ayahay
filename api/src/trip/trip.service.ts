import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient, Trip } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import {
  AvailableTrips,
  IAccount,
  IBooking,
  ITrip,
  SearchAvailableTrips,
} from '@ayahay/models';
import { TripMapper } from './trip.mapper';
import { isEmpty } from 'lodash';
import {
  CreateTripsFromSchedulesRequest,
  PaginatedRequest,
  PaginatedResponse,
  TripSearchByDateRange,
  UpdateTripCapacityRequest,
} from '@ayahay/http';
import { TripValidator } from './trip.validator';
import { ShippingLineService } from '@/shipping-line/shipping-line.service';
import { ShipService } from '@/ship/ship.service';
import { UtilityService } from '@/utility.service';
import { EmailService } from '@/email/email.service';
import { BookingMapper } from '@/booking/booking.mapper';

const TRIP_AVAILABLE_QUERY = Prisma.sql`
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
    STRING_AGG(tc.adult_fare::TEXT, '|') AS "pipeSeparatedCabinFares",
    STRING_AGG(tc.available_passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinAvailableCapacities",
    STRING_AGG(tc.passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinCapacities",
    STRING_AGG(c.cabin_type_id::TEXT, '|') AS "pipeSeparatedCabinTypeIds",
    STRING_AGG(c.name::TEXT, '|') AS "pipeSeparatedCabinNames",
    STRING_AGG(c.recommended_passenger_capacity::TEXT, '|') AS "pipeSeparatedRecommendedCabinCapacities",
    STRING_AGG(ct.name::TEXT, '|') AS "pipeSeparatedCabinTypeNames",
    STRING_AGG(ct.description::TEXT, '|') AS "pipeSeparatedCabinTypeDescriptions"
  FROM ayahay.trip t
    INNER JOIN ayahay.trip_cabin tc ON t.id = tc.trip_id
    INNER JOIN ayahay.cabin c ON tc.cabin_id = c.id
    INNER JOIN ayahay.cabin_type ct ON c.cabin_type_id = ct.id
`;

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingLineService: ShippingLineService,
    private readonly shipService: ShipService,
    private readonly emailService: EmailService,
    private readonly utilityService: UtilityService,
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
    tripWhereUniqueInput: Prisma.TripWhereUniqueInput, //{} is only temp, TripWhereUniqueInput is not part of referenceNo
    tripIncludeInput?: Prisma.TripInclude
  ): Promise<Trip> {
    const trip = await this.prisma.trip.findUnique({
      where: tripWhereUniqueInput,
      include: tripIncludeInput,
    });
    if (!trip) {
      throw new NotFoundException('Trip Not Found');
    }

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
      ${TRIP_AVAILABLE_QUERY}
      WHERE t.available_vehicle_capacity >= ${Number(vehicleCount)}
        AND t.departure_date > ${departureDate}::TIMESTAMP
        AND t.departure_date <= ${dateSelectedPlusAWeek.toISOString()}::DATE + 1 - interval '1 sec'
        AND t.src_port_id = ${Number(srcPortId)}
        AND t.dest_port_id = ${Number(destPortId)}
        AND t.status = 'Awaiting'
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
        availableVehicleTypes: {
          include: {
            vehicleType: true,
          },
        },
      },
    });

    return trips.map((trip) => this.tripMapper.convertTripToDto(trip));
  }

  async getTripsByDateRange(dates: TripSearchByDateRange) {
    const { startDate, endDate } = dates;

    const trips = await this.prisma.$queryRaw<AvailableTrips[]>`
      ${TRIP_AVAILABLE_QUERY}
      WHERE t.departure_date > ${startDate}::TIMESTAMP
      AND t.departure_date <= ${endDate}::TIMESTAMP
 	    GROUP BY t.id
      ORDER BY t.departure_date ASC
    `;

    return trips.map((trip) =>
      this.tripMapper.convertAvailableTripsToDto(trip)
    );
  }

  async getBookingsOfTrip(
    pagination: PaginatedRequest,
    tripId: number
  ): Promise<PaginatedResponse<IBooking>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const bookingIds = await this.prisma.bookingVehicle.findMany({
      where: {
        tripId,
      },
      select: {
        bookingId: true,
      },
    });

    const bookingIdsStrArr = bookingIds.map(({ bookingId }) => bookingId);

    const where = {
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
        bookingVehicles: {
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
        this.bookingMapper.convertBookingToSummary(booking)
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
    const tripVehicleTypesPerTrip: {
      [referenceNo: string]: Prisma.TripVehicleTypeCreateManyInput[];
    } = {};

    for (const trip of tripsToCreate) {
      const referenceNo = trip.referenceNo;
      // TODO: handle the unlikely scenario when referenceNo is repeated twice

      tripReferenceNos.push(referenceNo);
      tripEntities.push(this.tripMapper.convertTripToEntityForCreation(trip));
      tripCabinsPerTrip[referenceNo] = trip.availableCabins.map((tripCabin) =>
        this.tripMapper.convertTripCabinToEntityForCreation(tripCabin)
      );
      tripVehicleTypesPerTrip[referenceNo] = trip.availableVehicleTypes.map(
        (tripVehicleType) =>
          this.tripMapper.convertTripVehicleTypeToEntityForCreation(
            tripVehicleType
          )
      );
    }

    await this.prisma.$transaction(async (transactionContext) => {
      await transactionContext.trip.createMany({
        data: tripEntities,
      });

      const tripCabinEntities: Prisma.TripCabinCreateManyInput[] = [];
      const tripVehicleTypeEntities: Prisma.TripVehicleTypeCreateManyInput[] =
        [];

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
        const tripVehicleTypesOfTrip =
          tripVehicleTypesPerTrip[createdTripEntity.referenceNo];

        for (const tripCabin of tripCabinsOfTrip) {
          tripCabin.tripId = createdTripEntity.id;
          tripCabinEntities.push(tripCabin);
        }

        for (const tripVehicleType of tripVehicleTypesOfTrip) {
          tripVehicleType.tripId = createdTripEntity.id;
          tripVehicleTypeEntities.push(tripVehicleType);
        }
      }

      await transactionContext.tripCabin.createMany({
        data: tripCabinEntities,
      });

      await transactionContext.tripVehicleType.createMany({
        data: tripVehicleTypeEntities,
      });
    });
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

    this.utilityService.verifyLoggedInAccountHasAccessToShippingLineRestrictedEntity(
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

  async cancelTrip(
    tripId: number,
    reason: string,
    loggedInAccount: IAccount
  ): Promise<void> {
    const tripToCancel = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        srcPort: true,
        destPort: true,
      },
    });

    if (tripToCancel === null) {
      throw new NotFoundException();
    }

    this.utilityService.verifyLoggedInAccountHasAccessToShippingLineRestrictedEntity(
      tripToCancel,
      loggedInAccount
    );

    if (tripToCancel.status !== 'Awaiting') {
      throw new BadRequestException(
        'Cannot cancel a cancelled or arrived trip.'
      );
    }

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

      await this.shipService.createVoyageForTrip(
        tripToCancel,
        transactionContext as any
      );
    });
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

    this.utilityService.verifyLoggedInAccountHasAccessToShippingLineRestrictedEntity(
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

  async setTripAsCancelled(
    tripId: number,
    reason: string,
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

    this.utilityService.verifyLoggedInAccountHasAccessToShippingLineRestrictedEntity(
      tripToUpdate,
      loggedInAccount
    );

    if (tripToUpdate.status !== 'Awaiting') {
      throw new BadRequestException(
        'Cannot set a cancelled or arrived trip as cancelled.'
      );
    }

    await this.prisma.$transaction(async (transactionContext) => {
      await transactionContext.trip.update({
        where: {
          id: tripId,
        },
        data: {
          status: 'Cancelled',
        },
      });

      await this.voidBookingsOfTrip(tripId, transactionContext as any);

      await this.emailService.prepareTripCancelledEmail(
        { tripId, reason },
        transactionContext as any
      );

      await this.shipService.createVoyageForTrip(
        tripToUpdate,
        transactionContext as any
      );
    });
  }

  private async voidBookingsOfTrip(
    tripId: number,
    transactionContext?: PrismaClient
  ): Promise<void> {
    transactionContext ??= this.prisma;
    const bookingIds = await transactionContext.bookingPassenger.findMany({
      where: {
        tripId,
      },
      select: {
        bookingId: true,
      },
    });

    if (bookingIds.length === 0) {
      return;
    }

    const bookingIdsStrArr = bookingIds.map(({ bookingId }) => bookingId);

    await transactionContext.booking.updateMany({
      where: {
        id: {
          in: bookingIdsStrArr,
        },
      },
      data: {
        bookingStatus: 'Cancelled',
        failureCancellationRemarks: 'Trip Cancelled',
      },
    });
  }
}
