import { Descriptions, Skeleton, Typography, Grid, QRCode } from 'antd';
import { IBooking } from '@ayahay/models/booking.model';
import { PAYMENT_STATUS } from '@ayahay/constants';
import React from 'react';
import PassengersSummary from './PassengersSummary';
import dayjs from 'dayjs';
import TripSummary from './TripSummary';
import VehiclesSummary from './VehiclesSummary';

const { useBreakpoint } = Grid;
const { Title } = Typography;

interface BookingSummaryProps {
  booking?: IBooking;
}

export default function BookingSummary({ booking }: BookingSummaryProps) {
  const screens = useBreakpoint();

  return (
    <Skeleton loading={booking === undefined} active>
      {booking && booking.createdAtIso?.length > 0 && (
        <section>
          <article>
            <p>
              Show this QR code to the person in charge to verify your booking
            </p>
            <QRCode
              size={256}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              value={window.location.href}
              viewBox={`0 0 256 256`}
            />
          </article>

          <article>
            <Descriptions bordered={screens.sm} column={2}>
              <Descriptions.Item label='Booking Status'>
                {PAYMENT_STATUS[booking.status]}
              </Descriptions.Item>
              <Descriptions.Item label='Booking Date'>
                {dayjs(booking.createdAtIso).format('MMMM D, YYYY [at] h:mm A')}
              </Descriptions.Item>
              <Descriptions.Item label='Booking Reference No'>
                {booking.referenceNo}
              </Descriptions.Item>
              <Descriptions.Item label='Number of Passengers'>
                {booking.bookingPassengers?.length}
              </Descriptions.Item>
            </Descriptions>
          </article>
        </section>
      )}
      {booking && booking.bookingPassengers?.[0]?.trip && (
        <section>
          <Title level={2}>Trip Details</Title>
          <TripSummary trip={booking?.bookingPassengers?.[0]?.trip} />
        </section>
      )}
      {booking &&
        booking.bookingPassengers &&
        booking.bookingPassengers.length > 0 && (
          <section>
            <Title level={2}>Passengers</Title>
            <PassengersSummary
              passengers={booking.bookingPassengers}
              allowCheckIn={booking?.status === 'Success'}
            />
          </section>
        )}
      {booking &&
        booking.bookingVehicles &&
        booking.bookingVehicles.length > 0 && (
          <section>
            <Title level={2}>Vehicles</Title>
            <VehiclesSummary
              vehicles={booking.bookingVehicles}
              allowCheckIn={booking?.status === 'Success'}
            />
          </section>
        )}
      {booking && booking.paymentItems && (
        <article id='payment-summary' style={{ maxWidth: '512px' }}>
          <Title level={2}>Payment Summary</Title>

          <Descriptions bordered column={{ xxl: 1 }}>
            {booking.paymentItems.map((paymentItem) => (
              <Descriptions.Item label={paymentItem.description}>
                ₱{paymentItem.price}
              </Descriptions.Item>
            ))}
            <Descriptions.Item label='Total' style={{ fontWeight: 600 }}>
              ₱{booking.totalPrice}
            </Descriptions.Item>
          </Descriptions>
        </article>
      )}
    </Skeleton>
  );
}
