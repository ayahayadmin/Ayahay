import { Descriptions, Skeleton, Typography, Grid, QRCode, Button } from 'antd';
import { IBooking } from '@ayahay/models/booking.model';
import { PAYMENT_STATUS } from '@ayahay/constants';
import React, { useEffect, useState } from 'react';
import PassengersSummary from './PassengersSummary';
import dayjs from 'dayjs';
import TripSummary from './TripSummary';
import VehiclesSummary from './VehiclesSummary';
import PaymentSummary from './PaymentSummary';
import { PrinterOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;
const { Title } = Typography;

interface BookingSummaryProps {
  booking?: IBooking;
  titleLevel: 1 | 2 | 3 | 4 | 5;
  hasPrivilegedAccess?: boolean;
  onCheckInPassenger?: (bookingPassengerId: number) => Promise<void>;
  onCheckInVehicle?: (bookingVehicleId: number) => Promise<void>;
}

export default function BookingSummary({
  booking,
  titleLevel,
  hasPrivilegedAccess,
  onCheckInPassenger,
  onCheckInVehicle,
}: BookingSummaryProps) {
  const screens = useBreakpoint();
  const [isPrinting, setIsPrinting] = useState(false);

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

  const getUserAction = () => {
    if (booking === undefined) {
      return '';
    }

    switch (booking.status) {
      case 'Pending':
        return 'The QR code will be available after your payment has been processed.';
      case 'Success':
        return 'Show this QR code to the person in charge to verify your booking';
    }
    return '';
  };

  const completeBookingSummary = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {booking && booking.createdAtIso?.length > 0 && (
        <section
          style={{
            display: 'flex',
            flexWrap: screens.lg ? 'nowrap' : 'wrap',
          }}
        >
          <article style={{ flexGrow: '1' }}>
            <p>{getUserAction()}</p>
            <QRCode
              value={window.location.href}
              size={screens.sm ? 256 : 192}
              viewBox={`0 0 256 256`}
              type='svg'
              status={booking.status === 'Success' ? 'active' : 'loading'}
            />
          </article>
          <article style={{ flexGrow: '1', position: 'relative' }}>
            <Descriptions
              bordered={screens.sm}
              column={1}
              style={{ marginBottom: 40 }}
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
            {booking.status === 'Success' && (
              <Button
                className='hide-on-print'
                type='primary'
                onClick={() => onClickPrint()}
                style={{ position: 'absolute', bottom: 0 }}
              >
                <PrinterOutlined rev={undefined} />
                Print
              </Button>
            )}
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
      {booking && booking.createdAtIso?.length > 0 && (
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
      {booking && booking.bookingPassengers?.[0]?.trip && (
        <section>
          <p>
            {booking.bookingPassengers?.[0].trip.srcPort?.name} -{' '}
            {booking.bookingPassengers?.[0].trip.destPort?.name}
          </p>
          <p>
            {dayjs(booking.bookingPassengers?.[0].trip.departureDateIso).format(
              'MMM D, YYYY [at] h:mm A'
            )}
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
