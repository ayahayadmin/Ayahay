import { Descriptions, Skeleton, Typography, Grid, QRCode, Button } from 'antd';
import { IBooking } from '@ayahay/models/booking.model';
import {
  BOOKING_CANCELLATION_TYPE,
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from '@ayahay/constants';
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
  canCheckIn?: boolean;
  showTripSummary: boolean;
  onPayBooking?: () => Promise<void>;
  onCancelBooking?: (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => Promise<void>;
  onCheckInPassenger?: (tripId: number, passengerId: number) => Promise<void>;
  onCheckInVehicle?: (tripId: number, vehicleId: number) => Promise<void>;
}

export default function BookingSummary({
  booking,
  titleLevel,
  hasPrivilegedAccess,
  canCheckIn,
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

  const onClickCancel = (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => {
    setIsCancellationModalOpen(false);
    onCancelBooking && onCancelBooking(remarks, reasonType);
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
            onConfirmCancellation={(remarks, reasonType) =>
              onClickCancel(remarks, reasonType)
            }
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
              {hasPrivilegedAccess && (
                <Descriptions.Item label='Contact Number'>
                  {booking.contactMobile}
                </Descriptions.Item>
              )}
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
            canCheckIn={canCheckIn}
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

  const minimalBookingSummary = booking && (
    <div>
      <QRCode
        value={`${process.env.NEXT_PUBLIC_WEB_URL}/bookings/${booking.id}`}
        size={160}
        viewBox={`0 0 256 256`}
        type='svg'
      />
      {bookingTrip &&
        bookingTrip.bookingTripPassengers &&
        bookingTrip.bookingTripPassengers.map((bookingTripPassenger, index) => (
          <div key={index} style={{ breakBefore: 'page' }}>
            <section>
              <p>Ref # {booking.referenceNo}</p>
              <QRCode
                value={`${process.env.NEXT_PUBLIC_WEB_URL}/bookings/${booking.id}/trips/${bookingTripPassenger.tripId}/passengers/${bookingTripPassenger.passengerId}`}
                size={160}
                viewBox={`0 0 256 256`}
                type='svg'
              />
            </section>
            <section>
              <p>
                {trip?.srcPort?.name} - {trip?.destPort?.name}
              </p>
              <p>
                {dayjs(trip?.departureDateIso).format(
                  'MMM D, YYYY [at] h:mm A'
                )}
              </p>
            </section>
            <section>
              <table style={{ tableLayout: 'fixed', width: '100%' }}>
                <tbody>
                  <tr>
                    <td>
                      {bookingTripPassenger.passenger?.firstName}&nbsp;
                      {bookingTripPassenger.passenger?.lastName}
                    </td>
                    <td>₱{bookingTripPassenger.totalPrice}</td>
                  </tr>
                </tbody>
              </table>
            </section>
            <p style={{ textAlign: 'center' }}>Powered by AYAHAY</p>
          </div>
        ))}
    </div>
  );

  return (
    <Skeleton loading={booking === undefined} active>
      {isPrinting && minimalBookingSummary}
      {!isPrinting && completeBookingSummary}
    </Skeleton>
  );
}
