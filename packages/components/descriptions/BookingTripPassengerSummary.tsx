import React, { useState } from 'react';
import TripSummary from './TripSummary';
import {
  Badge,
  Button,
  Descriptions,
  QRCode,
  Skeleton,
  Typography,
} from 'antd';
import { IBookingTripPassenger } from '@ayahay/models';
import { PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useBookingControls } from '@ayahay/hooks/booking';
import BookingCancellationModal from '../modals/BookingCancellationModal';
import dayjs from 'dayjs';
import 'dayjs/plugin/relativeTime';

import {
  BOOKING_CANCELLATION_TYPE,
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from '@ayahay/constants';
import PaymentSummary from './PaymentSummary';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

const { Title } = Typography;

interface BookingTripPassengerSummaryProps {
  bookingTripPassenger?: IBookingTripPassenger;
  hasPrivilegedAccess?: boolean;
  onCheckInPassenger: () => Promise<void>;
  onRemovePassenger: (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => Promise<void>;
}

export default function BookingTripPassengerSummary({
  bookingTripPassenger,
  hasPrivilegedAccess,
  onCheckInPassenger,
  onRemovePassenger,
}: BookingTripPassengerSummaryProps) {
  const screens = useBreakpoint();
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const booking = bookingTripPassenger?.booking;
  const trip = bookingTripPassenger?.trip;
  const passenger = bookingTripPassenger?.passenger;
  const bookingPaymentItems = bookingTripPassenger?.bookingPaymentItems;

  const {
    isPrinting,
    onClickPrint,
    showQrCode,
    showCancelBookingButton,
    getUserAction,
  } = useBookingControls(booking, trip, hasPrivilegedAccess);

  const onClickRemove = (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => {
    setIsRemoveModalOpen(false);
    onRemovePassenger(remarks, reasonType);
  };

  const bookingActions = (
    <div style={{ display: 'flex', gap: '8px' }} className='hide-on-print'>
      <Button type='primary' onClick={() => onClickPrint()}>
        <PrinterOutlined />
        Print Ticket
      </Button>
      {bookingTripPassenger?.checkInDate === undefined && (
        <Button type='primary' onClick={() => onCheckInPassenger()}>
          Check-In Passenger
        </Button>
      )}
      {showCancelBookingButton && (
        <>
          <Button
            type='primary'
            danger
            onClick={() => setIsRemoveModalOpen(true)}
          >
            Remove Passenger
          </Button>
          <BookingCancellationModal
            open={isRemoveModalOpen}
            onConfirmCancellation={(remarks, reasonType) =>
              onClickRemove(remarks, reasonType)
            }
            onCancel={() => setIsRemoveModalOpen(false)}
          ></BookingCancellationModal>
        </>
      )}
    </div>
  );

  const completeSummary = booking && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Button
        type='link'
        href={`/bookings/${booking?.id}`}
        icon={<ArrowLeftOutlined />}
        style={{ alignSelf: 'start' }}
      >
        Booking Summary
      </Button>
      <Title level={1}>Booking Details</Title>
      <section
        style={{
          display: 'flex',
          flexWrap: screens.lg ? 'nowrap' : 'wrap',
        }}
      >
        {showQrCode && bookingTripPassenger.removedReason === undefined && (
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
            <Descriptions.Item label='Passenger Name'>
              {passenger?.firstName} {passenger?.lastName}
            </Descriptions.Item>
            <Descriptions.Item label='Status'>
              {bookingTripPassenger.removedReason !== undefined ? (
                <Badge
                  status='error'
                  text={`Removed due to ${bookingTripPassenger.removedReason}`}
                />
              ) : bookingTripPassenger.checkInDate ? (
                <Badge
                  status='success'
                  text={`Checked in ${dayjs(
                    bookingTripPassenger.checkInDate
                  ).fromNow()}`}
                />
              ) : (
                <Badge status='default' text='Not checked in' />
              )}
            </Descriptions.Item>
          </Descriptions>
          {bookingTripPassenger.removedReason === undefined && bookingActions}
        </article>
      </section>
      <section id='trip-summary'>
        <Title level={2}>Trip Details</Title>
        <TripSummary trip={trip} />
      </section>
      <section id='payment-summary'>
        <Title level={2}>Payment Summary</Title>
        <PaymentSummary paymentItems={bookingPaymentItems} />
      </section>
    </div>
  );

  const minimalSummary = booking && (
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
      <section>
        <table style={{ tableLayout: 'fixed', width: '100%' }}>
          <tbody>
            <tr>
              <td>
                {bookingTripPassenger?.passenger?.firstName}&nbsp;
                {bookingTripPassenger?.passenger?.lastName}
              </td>
              <td>₱{bookingTripPassenger?.totalPrice}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <p style={{ textAlign: 'center' }}>Powered by AYAHAY</p>
    </div>
  );

  return (
    <Skeleton loading={bookingTripPassenger === undefined} active>
      {isPrinting && minimalSummary}
      {!isPrinting && completeSummary}
    </Skeleton>
  );
}
