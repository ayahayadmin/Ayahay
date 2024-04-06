import { Descriptions, Skeleton, Typography, Grid, QRCode, Button } from 'antd';
import { IBooking } from '@ayahay/models/booking.model';
import { BOOKING_STATUS, PAYMENT_STATUS } from '@ayahay/constants';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import PaymentSummary from './PaymentSummary';
import { PrinterOutlined } from '@ant-design/icons';
import BookingCancellationModal from '../modals/BookingCancellationModal';
import BookingTripSummary from './BookingTripSummary';
import { combineBookingPaymentItems } from '@ayahay/services/booking.service';
import { useBookingControls } from '@ayahay/hooks/booking';

const { useBreakpoint } = Grid;
const { Title } = Typography;

interface BookingSummaryProps {
  booking?: IBooking;
  titleLevel: 1 | 2 | 3 | 4 | 5;
  hasPrivilegedAccess?: boolean;
  showTripSummary: boolean;
  onPayBooking?: () => Promise<void>;
  onCancelBooking?: (remarks: string) => Promise<void>;
  onCheckInPassenger?: (tripId: number, passengerId: number) => Promise<void>;
  onCheckInVehicle?: (tripId: number, vehicleId: number) => Promise<void>;
}

export default function BookingSummary({
  booking,
  titleLevel,
  hasPrivilegedAccess,
  showTripSummary,
  onPayBooking,
  onCancelBooking,
  onCheckInPassenger,
  onCheckInVehicle,
}: BookingSummaryProps) {
  const screens = useBreakpoint();

  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);

  const bookingTrip = booking?.bookingTrips?.[0];
  const trip = bookingTrip?.trip;
  const bookingPaymentItems = booking
    ? combineBookingPaymentItems(booking)
    : [];

  const {
    isPrinting,
    onClickPrint,
    showQrCode,
    showCancelBookingButton,
    getUserAction,
  } = useBookingControls(booking, trip, hasPrivilegedAccess);

  const onClickCancel = (remarks: string) => {
    setIsCancellationModalOpen(false);
    onCancelBooking && onCancelBooking(remarks);
  };

  const payable =
    booking?.bookingStatus === 'Confirmed' &&
    booking?.paymentStatus === 'None' &&
    onPayBooking;

  const bookingActions = (
    <div style={{ display: 'flex', gap: '8px' }} className='hide-on-print'>
      {payable && (
        <Button type='primary' onClick={() => onPayBooking()}>
          Pay
        </Button>
      )}
      <Button type='primary' onClick={() => onClickPrint()}>
        <PrinterOutlined />
        Print Ticket
      </Button>
      {bookingTrip &&
        bookingTrip.bookingTripVehicles &&
        bookingTrip.bookingTripVehicles.length > 0 && (
          <Button
            type='primary'
            href={`/bookings/${booking.id}/bol`}
            target='_blank'
          >
            <PrinterOutlined />
            Print BOL
          </Button>
        )}
      {showCancelBookingButton && onCancelBooking && (
        <>
          <Button
            type='default'
            onClick={() => setIsCancellationModalOpen(true)}
          >
            Void
          </Button>
          <BookingCancellationModal
            open={isCancellationModalOpen}
            onConfirmCancellation={(remarks) => onClickCancel(remarks)}
            onCancel={() => setIsCancellationModalOpen(false)}
          ></BookingCancellationModal>
        </>
      )}
    </div>
  );

  const completeBookingSummary = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {booking && booking.bookingStatus === 'Confirmed' && (
        <section
          style={{
            display: 'flex',
            flexWrap: screens.lg ? 'nowrap' : 'wrap',
          }}
        >
          {showQrCode && (
            <article style={{ flexGrow: '1' }}>
              <p>{getUserAction()}</p>
              <QRCode
                value={window.location.href}
                size={screens.sm ? 256 : 192}
                viewBox={`0 0 256 256`}
                type='svg'
              />
            </article>
          )}
          <article style={{ flexGrow: '1', position: 'relative' }}>
            <Descriptions
              bordered={screens.sm}
              column={1}
              style={{ marginBottom: 40 }}
            >
              <Descriptions.Item label='Booking Status'>
                {BOOKING_STATUS[booking.bookingStatus]}
              </Descriptions.Item>
              <Descriptions.Item label='Payment Status'>
                {PAYMENT_STATUS[booking.paymentStatus]}
              </Descriptions.Item>
              <Descriptions.Item label='Booking Date'>
                {dayjs(booking.createdAtIso).format('MMMM D, YYYY [at] h:mm A')}
              </Descriptions.Item>
              <Descriptions.Item label='Booking Reference No'>
                {booking.referenceNo}
              </Descriptions.Item>
            </Descriptions>
            {bookingActions}
          </article>
        </section>
      )}
      {booking &&
        booking.bookingTrips?.map((bookingTrip) => (
          <BookingTripSummary
            bookingTrip={bookingTrip}
            titleLevel={titleLevel}
            hasPrivilegedAccess={hasPrivilegedAccess}
            showTripSummary={showTripSummary}
            onCheckInPassenger={onCheckInPassenger}
            onCheckInVehicle={onCheckInVehicle}
          />
        ))}
      {bookingPaymentItems.length > 0 && (
        <section id='payment-summary'>
          <Title level={titleLevel}>Payment Summary</Title>
          <PaymentSummary paymentItems={bookingPaymentItems} />
        </section>
      )}
    </div>
  );

  const minimalBookingSummary = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {showQrCode && (
        <section>
          <p>Ref # {booking.referenceNo}</p>
          <QRCode
            value={window.location.href}
            size={160}
            viewBox={`0 0 256 256`}
            type='svg'
          />
        </section>
      )}
      {trip && (
        <section>
          <p>
            {trip.srcPort?.name} - {trip.destPort?.name}
          </p>
          <p>
            {dayjs(trip.departureDateIso).format('MMM D, YYYY [at] h:mm A')}
          </p>
        </section>
      )}
      {bookingTrip &&
        bookingTrip.bookingTripPassengers &&
        bookingTrip.bookingTripPassengers.length > 0 && (
          <section>
            <p>Pax {bookingTrip.bookingTripPassengers.length} NAC</p>
            <table style={{ tableLayout: 'fixed', width: '100%' }}>
              <tbody>
                {bookingTrip.bookingTripPassengers.map(
                  (bookingTripPassenger, index) => (
                    <tr key={index}>
                      <td>
                        {bookingTripPassenger.passenger?.firstName}&nbsp;
                        {bookingTripPassenger.passenger?.lastName}
                      </td>
                      <td>₱{bookingTripPassenger.totalPrice}</td>
                    </tr>
                  )
                )}
                <tr>
                  <td>Total</td>
                  <td>₱{booking.totalPrice}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}
      <p style={{ textAlign: 'center' }}>Powered by AYAHAY</p>
    </div>
  );

  return (
    <Skeleton loading={booking === undefined} active>
      {isPrinting && minimalBookingSummary}
      {!isPrinting && completeBookingSummary}
    </Skeleton>
  );
}
