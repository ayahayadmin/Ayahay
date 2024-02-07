import { Descriptions, Skeleton, Typography, Grid, QRCode, Button } from 'antd';
import { IBooking } from '@ayahay/models/booking.model';
import { BOOKING_STATUS, PAYMENT_STATUS } from '@ayahay/constants';
import React, { useEffect, useState } from 'react';
import PassengersSummary from './PassengersSummary';
import dayjs from 'dayjs';
import TripSummary from './TripSummary';
import VehiclesSummary from './VehiclesSummary';
import PaymentSummary from './PaymentSummary';
import { PrinterOutlined } from '@ant-design/icons';
import BookingCancellationModal from '@ayahay/web/components/booking/BookingCancellationModal';

const { useBreakpoint } = Grid;
const { Title } = Typography;

interface BookingSummaryProps {
  booking?: IBooking;
  titleLevel: 1 | 2 | 3 | 4 | 5;
  hasPrivilegedAccess?: boolean;
  onPayBooking?: () => Promise<void>;
  onCancelBooking?: (remarks: string) => Promise<void>;
  onCheckInPassenger?: (bookingPassengerId: number) => Promise<void>;
  onCheckInVehicle?: (bookingVehicleId: number) => Promise<void>;
}

export default function BookingSummary({
  booking,
  titleLevel,
  hasPrivilegedAccess,
  onPayBooking,
  onCancelBooking,
  onCheckInPassenger,
  onCheckInVehicle,
}: BookingSummaryProps) {
  const screens = useBreakpoint();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);

  const trip =
    booking?.bookingPassengers?.[0]?.trip ??
    booking?.bookingVehicles?.[0]?.trip;
  const showQrCode =
    booking?.bookingStatus === 'Confirmed' &&
    booking?.paymentStatus === 'Success' &&
    trip?.status === 'Awaiting';
  const payable =
    booking?.bookingStatus === 'Confirmed' &&
    booking?.paymentStatus === 'None' &&
    onPayBooking;

  useEffect(() => {
    if (isPrinting) {
      window.print();
      setIsPrinting(false);
    }
  }, [isPrinting]);

  const onClickPrint = () => {
    if (hasPrivilegedAccess) {
      // swap component to minimal view, then print (for thermal printer)
      setIsPrinting(true);
    } else {
      window.print();
    }
  };

  const onClickCancel = (remarks: string) => {
    setIsCancellationModalOpen(false);
    onCancelBooking && onCancelBooking(remarks);
  };

  const getUserAction = () => {
    if (booking === undefined) {
      return '';
    }

    switch (booking.paymentStatus) {
      case 'Pending':
        return 'The QR code will be available after your payment has been processed.';
      case 'Success':
        return 'Show this QR code to the person in charge to verify your booking';
    }
    return '';
  };

  const showCancelBookingButton =
    (booking?.bookingStatus === 'Confirmed' ||
      booking?.bookingStatus === 'Requested') &&
    hasPrivilegedAccess &&
    onCancelBooking;

  const bookingActions = (
    <div style={{ display: 'flex', gap: '8px' }} className='hide-on-print'>
      {payable && (
        <Button type='primary' onClick={() => onPayBooking()}>
          Pay
        </Button>
      )}
      <Button type='primary' onClick={() => onClickPrint()}>
        <PrinterOutlined rev={undefined} />
        Print
      </Button>
      {booking &&
        booking.bookingVehicles &&
        booking.bookingVehicles.length > 0 && (
          <Button
            type='primary'
            href={`/bookings/${booking.id}/bol`}
            target='_blank'
          >
            <PrinterOutlined rev={undefined} />
            Print BOL
          </Button>
        )}
      {showCancelBookingButton && (
        <Button type='default' onClick={() => setIsCancellationModalOpen(true)}>
          Void
        </Button>
      )}
      {showCancelBookingButton && (
        <BookingCancellationModal
          open={isCancellationModalOpen}
          onConfirmCancellation={(remarks) => onClickCancel(remarks)}
          onCancel={() => setIsCancellationModalOpen(false)}
        ></BookingCancellationModal>
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
              <Descriptions.Item label='Number of Passengers'>
                {booking.bookingPassengers?.length}
              </Descriptions.Item>
            </Descriptions>
            {bookingActions}
          </article>
        </section>
      )}
      {booking && trip && (
        <section>
          <Title level={titleLevel}>Trip Details</Title>
          <TripSummary trip={trip} />
        </section>
      )}
      {booking &&
        booking.bookingPassengers &&
        booking.bookingPassengers.length > 0 && (
          <section>
            <Title level={titleLevel}>Passengers</Title>
            <PassengersSummary
              passengers={booking.bookingPassengers}
              hasPrivilegedAccess={hasPrivilegedAccess}
              onCheckInPassenger={onCheckInPassenger}
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
              hasPrivilegedAccess={hasPrivilegedAccess}
              onCheckInVehicle={onCheckInVehicle}
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
      {booking &&
        booking.bookingPassengers &&
        booking.bookingPassengers.length > 0 && (
          <section>
            <p>Pax {booking.bookingPassengers.length} NAC</p>
            <table style={{ tableLayout: 'fixed', width: '100%' }}>
              <tbody>
                {booking.bookingPassengers.map((bookingPassenger) => (
                  <tr key={bookingPassenger.id}>
                    <td>
                      {bookingPassenger.passenger?.firstName}&nbsp;
                      {bookingPassenger.passenger?.lastName}
                    </td>
                    <td>₱{bookingPassenger.totalPrice}</td>
                  </tr>
                ))}
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
