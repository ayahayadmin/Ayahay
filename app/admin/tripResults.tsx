import AdminSearchQuery from '@/common/models/admin-search-query';
import { mockBookingPassengers } from '@/common/models/booking-passenger.model';
import Booking, { mockBookings } from '@/common/models/booking.model';
import { mockSeats } from '@/common/models/seat.model';
import Trip, { mockTrips } from '@/common/models/trip.model';
import { Collapse } from 'antd';
import { filter, find, forEach, map } from 'lodash';
import { useEffect, useState } from 'react';

const { Panel } = Collapse;

interface SearchResultsProp {
  searchQuery: AdminSearchQuery;
}

export default function TripResults({ searchQuery }: SearchResultsProp) {
  const [trips, setTrips] = useState([] as Trip[]);
  const [bookings, setBookings] = useState([] as Booking[]);
  const [seats, setSeats] = useState([] as any);

  useEffect(() => {
    fetchResults();
  }, [searchQuery]);

  const fetchResults = () => {
    setTrips(mockTrips);
  };

  const handleOnChange = (key: any) => {
    const allBookings = mockBookings;
    const filteredBookings = filter(allBookings, { tripId: Number(key) });
    setBookings(filteredBookings);

    const allBookingPassengers = mockBookingPassengers;
    const allSeats = mockSeats;
    const seatAssignments: any[] = [];
    forEach(filteredBookings, (booking) => {
      const bookingPassenger = find(allBookingPassengers, { id: booking.id });
      let seatId;
      if (bookingPassenger) {
        seatId = bookingPassenger.seatId;
      }
      const seats = find(allSeats, { id: seatId });
      seatAssignments.push([seats?.rowNumber, seats?.columnNumber]);
    });
    setSeats(seatAssignments);
  };

  return (
    <div>
      <Collapse accordion size='large' onChange={handleOnChange}>
        {trips &&
          map(trips, (trip) => {
            return (
              <Panel
                header={`Trip ${trip.id}: ${trip.srcPort.name} to ${trip.destPort.name}`}
                key={`${trip.id}`}
              >
                {bookings && <p>Total number of books: {bookings.length}</p>}
                {/* {seats} */}
              </Panel>
            );
          })}
      </Collapse>
    </div>
  );
}
