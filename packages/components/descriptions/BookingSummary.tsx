import { Descriptions, Skeleton, Typography, Grid, QRCode } from 'antd';
import { IBooking } from '@ayahay/models/booking.model';
import { PAYMENT_STATUS } from '@ayahay/constants';
import React from 'react';
import PassengersSummary from './PassengersSummary';
import dayjs from 'dayjs';
import TripSummary from './TripSummary';
import VehiclesSummary from './VehiclesSummary';
import PaymentSummary from "./PaymentSummary";

const { useBreakpoint } = Grid;
const { Title } = Typography;

interface BookingSummaryProps {
  booking?: IBooking;
  titleLevel: number;
}

export default function BookingSummary({ booking, titleLevel }: BookingSummaryProps) {
  const screens = useBreakpoint();

  return (
    <Skeleton loading={booking === undefined} active>
      <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
        {booking && booking.createdAtIso?.length > 0 && (
          <section style={{display: 'flex', flexWrap: screens.lg ? 'nowrap' : 'wrap'}}>
            <article style={{flexGrow: '1'}}>
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

            <article style={{flexGrow: '1'}}>
              <Descriptions
                bordered={screens.sm}
                column={1}
              >
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
            <Title level={titleLevel}>Trip Details</Title>
            <TripSummary trip={booking?.bookingPassengers?.[0]?.trip} />
          </section>
        )}
        {booking &&
          booking.bookingPassengers &&
          booking.bookingPassengers.length > 0 && (
            <section>
              <Title level={titleLevel}>Passengers</Title>
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
              <Title level={titleLevel}>Vehicles</Title>
              <VehiclesSummary
                vehicles={booking.bookingVehicles}
                allowCheckIn={booking?.status === 'Success'}
              />
            </section>
          )}
        {booking && booking.paymentItems && booking.paymentItems.length > 0 && (
          <section id='payment-summary'>
            <Title level={titleLevel}>Payment Summary</Title>
            <PaymentSummary paymentItems={booking.paymentItems} />
          </section>
        )}
      </div>
    </Skeleton>
  );
}
