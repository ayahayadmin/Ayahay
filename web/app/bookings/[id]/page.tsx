'use client';
import styles from './page.module.scss';
import React, { useEffect, useState } from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { getBookingById } from '@/services/booking.service';
import { IBooking } from '@ayahay/models/booking.model';
import { QRCode, Skeleton, Typography } from 'antd';
import TripSummary from '@ayahay/components/descriptions/TripSummary';
import { usePathname } from 'next/navigation';
import { useLoggedInAccount } from '@/hooks/auth';

const { Title } = Typography;

export default function GetBooking({ params }) {
  const { loggedInAccount } = useLoggedInAccount();
  const [booking, setBooking] = useState<IBooking | undefined>();
  const [qrCodeValue, setQrCodeValue] = useState<string>('');

  const loadBooking = async () => {
    const bookingId = params.id;
    const booking = await getBookingById(bookingId);
    setBooking(booking);
    setQrCodeValue(window.location.href);
  };

  useEffect(() => {
    loadBooking();
  }, [loggedInAccount]);

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Booking Summary</Title>
      <BookingSummary booking={booking} />
    </div>
  );
}
