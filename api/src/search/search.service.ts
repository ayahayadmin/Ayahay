import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking, Prisma, Trip } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import { SearchMapper } from './search.mapper';
import {
  DashboardTrips,
  TripInformation,
  TripSearchByDateRange,
} from '@ayahay/http';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private searchMapper: SearchMapper
  ) {}

  async getBookingsByReferenceNo(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BookingWhereUniqueInput;
    where?: Prisma.BookingWhereInput;
    orderBy?: Prisma.BookingOrderByWithRelationInput;
  }): Promise<Booking[]> {
    const { skip, take, cursor, where, orderBy } = params;

    const bookings = await this.prisma.booking.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });

    if (!bookings) {
      throw new NotFoundException('Booking/s Not Found');
    }

    return bookings;
  }

  async getTripsByReferenceNo(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TripWhereUniqueInput;
    where?: Prisma.TripWhereInput;
    orderBy?: Prisma.TripOrderByWithRelationInput;
  }): Promise<Trip[]> {
    const { skip, take, cursor, where, orderBy } = params;
    const { referenceNo } = where;
    if (!referenceNo) {
      throw new BadRequestException('Reference Number Cannot Be Empty');
    }

    const trips = await this.prisma.trip.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });

    if (!trips) {
      throw new NotFoundException('Trip/s Not Found');
    }

    return trips;
  }

  async getDashboardTrips(
    query: TripSearchByDateRange
  ): Promise<DashboardTrips[]> {
    const { startDate, endDate } = query;

    const trips = await this.prisma.$queryRaw<TripInformation[]>`
      WITH trips_matching_query AS (
        SELECT 
          id,
          src_port_id AS "srcPortId",
          dest_port_id AS "destPortId",
          departure_date AS "departureDate",
          ship_id AS "shipId",
          available_vehicle_capacity AS "availableVehicleCapacity",
          vehicle_capacity AS "vehicleCapacity"
        FROM ayahay.trip
        WHERE
          departure_date > ${startDate}::TIMESTAMP
          AND departure_date <= ${endDate}::TIMESTAMP
          AND status != 'Cancelled'
      ), confirmed_passengers AS (
        SELECT
          bp.trip_id,
          booking_id,
          passenger_id,
          check_in_date
        FROM ayahay.booking_trip_passenger bp
          INNER JOIN ayahay.booking b ON bp.booking_id = b.id
        WHERE 
          b.booking_status = 'Confirmed'
          AND trip_id IN (SELECT id FROM trips_matching_query)
        GROUP BY bp.trip_id, booking_id, passenger_id, check_in_date
      ), checked_in_passenger_count_per_trip AS (
        SELECT 
          trip_id,
          COUNT(*) AS "checkedInPassengerCount"
        FROM confirmed_passengers cp
        WHERE 
          cp.check_in_date IS NOT NULL
        GROUP BY trip_id
      ), not_checked_in_passenger_names AS (
        SELECT
        trip_id,
        STRING_AGG(p.first_name::TEXT, '|') AS "pipeSeparatedPassengerFirstNames",
        STRING_AGG(p.last_name::TEXT, '|') AS "pipeSeparatedPassengerLastNames"
        FROM confirmed_passengers cp
          INNER JOIN ayahay.passenger p ON cp.passenger_id = p.id
        WHERE 
          cp.check_in_date IS NULL
        GROUP BY trip_id
      ), checked_in_vehicle_count_per_trip AS (
        SELECT 
          trip_id,
          COUNT(*) AS "checkedInVehicleCount"
        FROM ayahay.booking_trip_vehicle
        WHERE 
          check_in_date IS NOT NULL
          AND trip_id IN (SELECT id FROM trips_matching_query)
        GROUP BY trip_id
      ), cabin_information_per_trip AS (
        SELECT
          tc.trip_id,
          STRING_AGG(c.cabin_type_id::TEXT, '|') AS "pipeSeparatedCabinTypeIds",
          STRING_AGG(c.name::TEXT, '|') AS "pipeSeparatedCabinNames",
          STRING_AGG(tc.adult_fare::TEXT, '|') AS "pipeSeparatedCabinFares",
          STRING_AGG(tc.available_passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinAvailableCapacities",
          STRING_AGG(tc.passenger_capacity::TEXT, '|') AS "pipeSeparatedCabinCapacities"
        FROM ayahay.trip_cabin tc
          INNER JOIN ayahay.cabin c ON tc.cabin_id = c.id 
        WHERE tc.trip_id IN (SELECT id FROM trips_matching_query)
        GROUP BY tc.trip_id 
      ), vehicle_rates_per_trip AS (
        SELECT
          trip_id,
          STRING_AGG(tvt.vehicle_type_id::TEXT, '|') AS "pipeSeparatedVehicleTypeIds",
          STRING_AGG(tvt.fare::TEXT, '|') AS "pipeSeparatedVehicleFares",
          STRING_AGG(vt.name::TEXT, '|') AS "pipeSeparatedVehicleNames"
        FROM ayahay.trip_vehicle_type tvt
          INNER JOIN ayahay.vehicle_type vt ON tvt.vehicle_type_id = vt.id
        WHERE trip_id IN (SELECT id FROM trips_matching_query)
        GROUP BY trip_id
      )
      SELECT 
        *
      FROM trips_matching_query t
        LEFT JOIN checked_in_passenger_count_per_trip pc ON t.id = pc.trip_id
        LEFT JOIN not_checked_in_passenger_names nc ON t.id = nc.trip_id
        LEFT JOIN checked_in_vehicle_count_per_trip vc ON t.id = vc.trip_id
        LEFT JOIN cabin_information_per_trip cb ON t.id = cb.trip_id
        LEFT JOIN vehicle_rates_per_trip vr ON t.id = vr.trip_id
      ORDER BY t."departureDate" ASC;
    `;

    return trips.map((trip) =>
      this.searchMapper.convertTripForDashboardTrips(trip)
    );
  }
}
