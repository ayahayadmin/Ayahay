'use client';
import styles from './page.module.scss';
import React, { useEffect, useState } from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { getBookingById } from '@/services/booking.service';
import { IBooking, mockBooking } from '@ayahay/models/booking.model';
import { Button, QRCode, Skeleton, Typography } from 'antd';
import TripSummary from '@ayahay/components/descriptions/TripSummary';
import { usePathname } from 'next/navigation';

const { Title } = Typography;

export default function GetBooking({ params }) {
  const [booking, setBooking] = useState<IBooking | undefined>();
  const onPageLoad = () => {
    const bookingId = parseInt(params.id);
    setBooking(getBookingById(bookingId) ?? mockBooking);
  };

  useEffect(onPageLoad, []);

  const onConfirmAttendance = () => {};

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Booking Summary</Title>
      <div className={styles['top-container']}>
        <section className={styles['verification-card']}>
          <Title level={2}>Quick Actions</Title>
          <Button type='primary' onClick={onConfirmAttendance}>
            Confirm Passengers Attendance
          </Button>
        </section>
        <section className={styles['trip-card']}>
          <Title level={2}>Trip Details</Title>
          <TripSummary trip={booking?.trip} />
        </section>
      </div>
      <Title level={2}>Passengers</Title>
      <BookingSummary booking={booking} />
    </div>
  );
}
