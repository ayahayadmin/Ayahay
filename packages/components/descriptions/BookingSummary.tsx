import {
  Descriptions,
  Skeleton,
  Typography,
  Grid,
  QRCode,
  Button,
  Segmented,
} from 'antd';
import { IBooking } from '@ayahay/models/booking.model';
import {
  BOOKING_CANCELLATION_TYPE,
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from '@ayahay/constants';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import PaymentSummary from './PaymentSummary';
import { PrinterOutlined } from '@ant-design/icons';
import BookingCancellationModal from '../modals/BookingCancellationModal';
import BookingTripSummary from './BookingTripSummary';
import { combineBookingPaymentItems } from '@ayahay/services/booking.service';
import { useBookingControls } from '@ayahay/hooks/booking';
import BookingReminders from './BookingReminders';
import { IPassenger, IVehicle } from '@ayahay/models';

const { useBreakpoint } = Grid;
const { Title } = Typography;

interface BookingSummaryProps {
  booking?: IBooking;
  titleLevel: 1 | 2 | 3 | 4 | 5;
  hasPrivilegedAccess?: boolean;
  canCheckIn?: boolean;
  onPayBooking?: () => Promise<void>;
  onCancelBooking?: (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => Promise<void>;
  onCheckInPassenger?: (tripId: number, passengerId: number) => Promise<void>;
  onUpdatePassenger?: (
    tripId: number,
    passengerId: number,
    passenger: IPassenger
  ) => Promise<void>;
  onCheckInVehicle?: (tripId: number, vehicleId: number) => Promise<void>;
  onUpdateVehicle?: (
    tripId: number,
    vehicleId: number,
    vehicle: IVehicle
  ) => Promise<void>;
}

export default function BookingSummary({
  booking,
  titleLevel,
  hasPrivilegedAccess,
  canCheckIn,
  onPayBooking,
  onCancelBooking,
  onCheckInPassenger,
  onUpdatePassenger,
  onCheckInVehicle,
  onUpdateVehicle,
}: BookingSummaryProps) {
  const screens = useBreakpoint();

  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [selectedTripIndex, setSelectedTripIndex] = useState(0);
  const [issuedBy, setIssuedBy] = useState('');

  const bookingTrip = booking?.bookingTrips?.[selectedTripIndex];
  const trip = bookingTrip?.trip;
  const bookingPaymentItems = booking
    ? combineBookingPaymentItems(booking)
    : [];

  useEffect(() => {
    if (
      !booking?.createdByAccount ||
      booking.createdByAccount.role === 'Passenger'
    ) {
      setIssuedBy('Ayahay');
      return;
    }
    const { email, travelAgency, shippingLine } = booking.createdByAccount;
    const emailWithoutDomain = email.split('@')[0];
    if (travelAgency) {
      setIssuedBy(`${emailWithoutDomain} @ ${travelAgency.name}`);
    }
    if (shippingLine) {
      setIssuedBy(`${emailWithoutDomain} @ ${shippingLine.name}`);
    }
  }, [booking]);
  const {
    isThermalPrinting,
    setIsThermalPrinting,
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

  const selectTrip = (selectedTripId: number) => {
    if (!booking || !booking.bookingTrips) {
      return;
    }
    const tripIndex = booking.bookingTrips.findIndex(
      ({ tripId }) => tripId === selectedTripId
    );
    setSelectedTripIndex(tripIndex);
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
      {hasPrivilegedAccess && (
        <Button type='primary' onClick={() => setIsThermalPrinting(true)}>
          <PrinterOutlined />
          Print Receipt
        </Button>
      )}
      {bookingTrip &&
        bookingTrip.bookingTripPassengers &&
        bookingTrip.bookingTripPassengers?.length > 0 && (
          <Button
            type='primary'
            href={`/bookings/${booking?.id}/itinerary`}
            target='_blank'
          >
            <PrinterOutlined />
            Print Itinerary
          </Button>
        )}
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
              <Descriptions.Item label='Booking ID'>
                {booking.id.toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label='Booking Reference No'>
                {booking.referenceNo}
              </Descriptions.Item>
              <Descriptions.Item label='Issued By'>
                {issuedBy}
              </Descriptions.Item>
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

              {booking.contactMobile && (
                <Descriptions.Item label='Contact Number'>
                  {booking.contactMobile}
                </Descriptions.Item>
              )}
              {booking.contactEmail && (
                <Descriptions.Item label='Email Address'>
                  {booking.contactEmail}
                </Descriptions.Item>
              )}
            </Descriptions>
            {bookingActions}
          </article>
        </section>
      )}

      {booking && booking.bookingTrips && booking.bookingTrips.length > 1 && (
        <Segmented
          size='large'
          options={booking.bookingTrips.map(({ trip }) => ({
            label: `${trip?.srcPort?.name} -> ${trip?.destPort?.name}`,
            value: trip?.id,
          }))}
          onChange={selectTrip}
          block
        />
      )}
      {bookingTrip && (
        <BookingTripSummary
          bookingTrip={bookingTrip}
          titleLevel={titleLevel}
          canCheckIn={canCheckIn}
          onCheckInPassenger={onCheckInPassenger}
          onUpdatePassenger={onUpdatePassenger}
          onCheckInVehicle={onCheckInVehicle}
          onUpdateVehicle={onUpdateVehicle}
        />
      )}
      {bookingPaymentItems.length > 0 && (
        <section id='payment-summary'>
          <Title level={titleLevel}>Payment Summary</Title>
          <PaymentSummary paymentItems={bookingPaymentItems} />
        </section>
      )}
      <BookingReminders
        shippingLineName={trip?.shippingLine?.name}
        titleLevel={titleLevel}
      />
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
      {booking &&
        booking.bookingTrips &&
        booking.bookingTrips.map((bookingTrip, tripIndex) => (
          <div key={tripIndex}>
            {bookingTrip.bookingTripPassengers &&
              bookingTrip.bookingTripPassengers.map(
                (bookingTripPassenger, passengerIndex) => (
                  <div key={passengerIndex} style={{ breakBefore: 'page' }}>
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
                        {bookingTrip.trip?.srcPort?.name} -&nbsp;
                        {bookingTrip.trip?.destPort?.name}
                      </p>
                      <p>
                        {dayjs(bookingTrip.trip?.departureDateIso).format(
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
                )
              )}
            {bookingTrip.bookingTripVehicles &&
              bookingTrip.bookingTripVehicles.map(
                (bookingTripVehicle, index) => (
                  <div key={index} style={{ breakBefore: 'page' }}>
                    <section>
                      <p>Ref # {booking.referenceNo}</p>
                      <QRCode
                        value={`${process.env.NEXT_PUBLIC_WEB_URL}/bookings/${booking.id}/trips/${bookingTripVehicle.tripId}/vehicles/${bookingTripVehicle.vehicleId}`}
                        size={160}
                        viewBox={`0 0 256 256`}
                        type='svg'
                      />
                    </section>
                    <section>
                      <p>
                        {bookingTrip.trip?.srcPort?.name} -&nbsp;
                        {bookingTrip.trip?.destPort?.name}
                      </p>
                      <p>
                        {dayjs(bookingTrip.trip?.departureDateIso).format(
                          'MMM D, YYYY [at] h:mm A'
                        )}
                      </p>
                    </section>
                    <section>
                      <table style={{ tableLayout: 'fixed', width: '100%' }}>
                        <tbody>
                          <tr>
                            <td>{bookingTripVehicle.vehicle?.plateNo}</td>
                            <td>{bookingTripVehicle.vehicle?.modelName}</td>
                            <td>₱{bookingTripVehicle.totalPrice}</td>
                          </tr>
                        </tbody>
                      </table>
                    </section>
                    <p style={{ textAlign: 'center' }}>Powered by AYAHAY</p>
                  </div>
                )
              )}
          </div>
        ))}
    </div>
  );

  return (
    <Skeleton loading={booking === undefined} active>
      {isThermalPrinting && minimalBookingSummary}
      {!isThermalPrinting && completeBookingSummary}
    </Skeleton>
  );
}
