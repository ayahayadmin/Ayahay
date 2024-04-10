import React, { useState } from 'react';
import TripSummary from './TripSummary';
import { Button, Descriptions, QRCode, Skeleton, Typography } from 'antd';
import { IBookingTripVehicle } from '@ayahay/models';
import { PrinterOutlined } from '@ant-design/icons';
import { useBookingControls } from '@ayahay/hooks/booking';
import BookingCancellationModal from '../modals/BookingCancellationModal';
import dayjs from 'dayjs';
import {
  BOOKING_CANCELLATION_TYPE,
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from '@ayahay/constants';
import PaymentSummary from './PaymentSummary';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';

const { Title } = Typography;

interface BookingTripVehicleSummaryProps {
  bookingTripVehicle?: IBookingTripVehicle;
  hasPrivilegedAccess?: boolean;
  onCheckInVehicle: () => Promise<void>;
  onRemoveVehicle: (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => Promise<void>;
}

export default function BookingTripVehicleSummary({
  bookingTripVehicle,
  hasPrivilegedAccess,
  onCheckInVehicle,
  onRemoveVehicle,
}: BookingTripVehicleSummaryProps) {
  const screens = useBreakpoint();
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const booking = bookingTripVehicle?.booking;
  const trip = bookingTripVehicle?.trip;
  const vehicle = bookingTripVehicle?.vehicle;
  const bookingPaymentItems = bookingTripVehicle?.bookingPaymentItems;

  const { showQrCode, showCancelBookingButton, getUserAction } =
    useBookingControls(booking, trip, hasPrivilegedAccess);

  const onClickRemove = (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => {
    setIsRemoveModalOpen(false);
    onRemoveVehicle(remarks, reasonType);
  };

  const bookingActions = (
    <div style={{ display: 'flex', gap: '8px' }} className='hide-on-print'>
      <Button type='primary'>
        <PrinterOutlined />
        Print BOL
      </Button>
      {bookingTripVehicle?.checkInDate === undefined && (
        <Button type='primary' onClick={() => onCheckInVehicle()}>
          Check-In Vehicle
        </Button>
      )}
      {showCancelBookingButton && (
        <>
          <Button type='default' onClick={() => setIsRemoveModalOpen(true)}>
            Remove Vehicle
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

  return (
    <Skeleton loading={bookingTripVehicle === undefined} active>
      {booking && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Title level={1}>Booking Details</Title>
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
                  {dayjs(booking.createdAtIso).format(
                    'MMMM D, YYYY [at] h:mm A'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label='Vehicle Plate Number'>
                  {vehicle?.plateNo}
                </Descriptions.Item>
                <Descriptions.Item label='Vehicle Model'>
                  {vehicle?.modelName}
                </Descriptions.Item>
                <Descriptions.Item label='Vehicle Type'>
                  {vehicle?.vehicleType?.name}
                </Descriptions.Item>
              </Descriptions>
              {bookingActions}
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
      )}
    </Skeleton>
  );
}
