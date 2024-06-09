import { IBookingTrip } from '@ayahay/models';
import { Typography } from 'antd';
import React from 'react';
import TripSummary from './TripSummary';
import PassengersSummary from './PassengersSummary';
import VehiclesSummary from './VehiclesSummary';

const { Title } = Typography;

interface BookingTripSummaryProps {
  bookingTrip: IBookingTrip;
  titleLevel: 1 | 2 | 3 | 4 | 5;
  canCheckIn?: boolean;
  onCheckInPassenger?: (tripId: number, passengerId: number) => Promise<void>;
  onCheckInVehicle?: (tripId: number, vehicleId: number) => Promise<void>;
}

export default function BookingTripSummary({
  bookingTrip,
  titleLevel,
  canCheckIn,
  onCheckInPassenger,
  onCheckInVehicle,
}: BookingTripSummaryProps) {
  return (
    <>
      <section>
        <Title level={titleLevel}>Trip Itinerary</Title>
        <TripSummary trip={bookingTrip.trip} />
      </section>
      {bookingTrip.bookingTripPassengers &&
        bookingTrip.bookingTripPassengers.length > 0 && (
          <section>
            <Title level={titleLevel + 1}>Passengers</Title>
            <PassengersSummary
              passengers={bookingTrip.bookingTripPassengers}
              canCheckIn={canCheckIn}
              onCheckInPassenger={onCheckInPassenger}
            />
          </section>
        )}
      {bookingTrip.bookingTripVehicles &&
        bookingTrip.bookingTripVehicles.length > 0 && (
          <section>
            <Title level={titleLevel + 1}>Vehicles</Title>
            <VehiclesSummary
              vehicles={bookingTrip.bookingTripVehicles}
              canCheckIn={canCheckIn}
              onCheckInVehicle={onCheckInVehicle}
            />
          </section>
        )}
    </>
  );
}
