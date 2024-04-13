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
  showTripSummary: boolean;
  canCheckIn?: boolean;
  onCheckInPassenger?: (tripId: number, passengerId: number) => Promise<void>;
  onCheckInVehicle?: (tripId: number, vehicleId: number) => Promise<void>;
}

export default function BookingTripSummary({
  bookingTrip,
  titleLevel,
  canCheckIn,
  showTripSummary,
  onCheckInPassenger,
  onCheckInVehicle,
}: BookingTripSummaryProps) {
  return (
    <>
      {showTripSummary && (
        <section>
          <Title level={titleLevel}>Trip Details</Title>
          <TripSummary trip={bookingTrip.trip} />
        </section>
      )}
      {bookingTrip.bookingTripPassengers &&
        bookingTrip.bookingTripPassengers.length > 0 && (
          <section>
            <Title level={titleLevel}>Passengers</Title>
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
            <Title level={titleLevel}>Vehicles</Title>
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
