'use client';
import React, { useEffect, useState } from 'react';
import BookingPassengersSummary from '@/common/components/booking/BookingPassengersSummary';
import { getBookingById } from '@/common/services/booking.service';
import Booking from '@/common/models/booking.model';
import { Button, QRCode, Skeleton, Typography } from 'antd';
import TripSummary from '@/common/components/descriptions/TripSummary';
import { usePathname } from 'next/navigation';

const { Title } = Typography;

export default function GetBooking({ params }) {
  const pathName = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [booking, setBooking] = useState<Booking | undefined>();
  const [qrCodeValue, setQrCodeValue] = useState<string>('');
  const onPageLoad = () => {
    const bookingId = parseInt(params.id);
    setBooking(getBookingById(bookingId));
    setQrCodeValue(window.location.href);
  };

  useEffect(onPageLoad, []);

  const onConfirmAttendance = () => {};

  return (
    <div>
      <Title level={1}>Booking Summary</Title>

      <Button type='link' onClick={() => setIsAdmin(!isAdmin)}>
        {isAdmin
          ? 'View this page as a passenger'
          : 'View this page as an admin'}
      </Button>
      {!isAdmin && qrCodeValue.length > 0 && (
        <section>
          <Title level={2}>QR Code</Title>
          <Skeleton loading={booking === undefined} active>
            <p>
              Show this QR code to the person in charge to verify your booking
            </p>
            <QRCode
              size={256}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              value={qrCodeValue}
              viewBox={`0 0 256 256`}
            />
          </Skeleton>
        </section>
      )}
      {isAdmin && (
        <section>
          <Title level={2}>Quick Actions</Title>
          <Button type='primary' onClick={onConfirmAttendance}>
            Confirm Passengers Attendance
          </Button>
        </section>
      )}
      <Title level={2}>Trip Details</Title>
      <TripSummary trip={booking?.trip} />
      <Title level={2}>Passengers</Title>
      <BookingPassengersSummary booking={booking} />
    </div>
  );
}
