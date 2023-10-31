'use client';
import styles from './page.module.scss';
import React, { useEffect, useState } from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { getBookingById } from '@/services/booking.service';
import { hasPrivilegedAccess as _hasPrivilegedAccess } from '@ayahay/services/account.service';
import { IBooking } from '@ayahay/models/booking.model';
import { Typography } from 'antd';
import { useLoggedInAccount } from '@ayahay/hooks/auth';

const { Title } = Typography;

export default function GetBooking({ params }) {
  const { loggedInAccount } = useLoggedInAccount();
  const [booking, setBooking] = useState<IBooking | undefined>();
  const [hasPrivilegedAccess, setHasPrivilegedAccess] = useState(false);

  const loadBooking = async () => {
    const bookingId = params.id;
    const booking = await getBookingById(bookingId);
    setBooking(booking);
  };

  useEffect(() => {
    loadBooking();
    setHasPrivilegedAccess(_hasPrivilegedAccess(loggedInAccount));
  }, [loggedInAccount]);

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Booking Summary</Title>
      <BookingSummary
        booking={booking}
        titleLevel={2}
        hasPrivilegedAccess={hasPrivilegedAccess}
      />
    </div>
  );
}
