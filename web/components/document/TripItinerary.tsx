import { IBooking, IBookingTripPassenger, ITrip } from '@ayahay/models';
import React from 'react';
import { Flex, QRCode } from 'antd';
import dayjs from 'dayjs';
import { BlankUnderline } from './BillOfLading';
import BookingReminders from '@ayahay/components/descriptions/BookingReminders';

interface TripItineraryProps {
  booking: IBooking;
}

export default function TripItinerary({ booking }: TripItineraryProps) {
  return booking.bookingTrips?.map(({ trip, bookingTripPassengers }) => (
    <>
      {bookingTripPassengers?.map((tripPassenger, index) => (
        <div
          key={tripPassenger.tripId + '' + tripPassenger.passengerId}
          style={{ breakBefore: index === 0 ? 'auto' : 'page' }}
        >
          <ItineraryContent
            booking={booking}
            trip={trip}
            tripPassenger={tripPassenger}
          />
          <div style={{ marginTop: 10 }}>
            <BookingReminders
              shippingLineName={trip?.shippingLine?.name}
              titleLevel={5}
              fontSize={12}
            />
          </div>
          <span
            style={{
              padding: '0 280px',
              borderBottom: '1px dashed black',
            }}
          >
            CUT THIS AREA (VESSEL COPY)
          </span>
          <div style={{ marginTop: 10 }}>
            <ItineraryContent
              booking={booking}
              trip={trip}
              tripPassenger={tripPassenger}
            />
          </div>
        </div>
      ))}
    </>
  ));
}

interface ItineraryContentProps {
  booking: IBooking;
  trip: ITrip | undefined;
  tripPassenger: IBookingTripPassenger;
}

function ItineraryContent({
  booking,
  trip,
  tripPassenger,
}: ItineraryContentProps) {
  return (
    <>
      <Flex justify='space-between'>
        <section
          className='shipping-line-details'
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={`/assets/shipping-line-logos/${booking.shippingLine?.name}.png`}
            alt='Logo'
            height={80}
          />
          <span
            style={{
              fontWeight: 'bold',
            }}
          >
            {booking.shippingLine?.name}
          </span>
        </section>
        <section
          className='trip-details'
          style={{
            display: 'flex',
            alignItems: 'end',
            flexDirection: 'column',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}
        >
          <img src={`/assets/ayahay-logo.png`} alt='Logo' height={80} />
        </section>
      </Flex>
      <BlankUnderline width='100%' />
      <Flex justify='space-between'>
        <section
          className='passenger'
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontWeight: 'bold' }}>Passenger</span>
          <span>
            <strong>Name:</strong> {tripPassenger.passenger?.firstName}
            &nbsp;
            {tripPassenger.passenger?.lastName}
          </span>
          <span>
            <strong>Accommodation:</strong>&nbsp;
            {tripPassenger.cabin?.cabinType?.name}
          </span>
          <span>
            <strong>Seat:</strong>&nbsp;
            {tripPassenger.seat?.name}
          </span>
        </section>
        <section
          className='booking-details'
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontWeight: 'bold' }}>Booking Details</span>
          <span>
            <strong>Trip:</strong> {trip?.srcPort?.name} -&nbsp;
            {trip?.destPort?.name}&nbsp;
          </span>
          <span>
            <strong>Departure Date:</strong>&nbsp;
            {dayjs(trip?.departureDateIso).format('MMM D, YYYY [at] h:mm A')}
          </span>
          <span>
            <strong>Reference No.:</strong>&nbsp;
            {booking.referenceNo}
          </span>
          <span>
            <strong>Booking Date:</strong>&nbsp;
            {dayjs(booking.createdAtIso).format('MMM D, YYYY [at] h:mm A')}
          </span>
        </section>
        <section className='qr-code'>
          <span>DO NOT FOLD THIS IMAGE</span>
          <QRCode
            value={`${process.env.NEXT_PUBLIC_WEB_URL}/bookings/${booking.id}`}
            size={125}
            viewBox={`0 0 256 256`}
            type='svg'
          />
          <span>
            <strong>Ticket Price:</strong> {booking.totalPrice}
          </span>
        </section>
      </Flex>
    </>
  );
}
