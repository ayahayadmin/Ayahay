'use client';
import styles from './page.module.scss';
import React, { useEffect, useState } from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { getBookingById } from '@/services/booking.service';
import { hasPrivilegedAccess as _hasPrivilegedAccess } from '@ayahay/services/account.service';
import { IBooking } from '@ayahay/models/booking.model';
import { notification, Typography } from 'antd';
import {
  checkInPassenger,
  checkInVehicle,
} from '@ayahay/services/booking.service';
import { getAxiosError } from '@ayahay/services/error.service';
import { useAuth } from '@/app/contexts/AuthContext';

const { Title } = Typography;

export default function GetBooking({ params }) {
  const [api, contextHolder] = notification.useNotification();
  const { loggedInAccount } = useAuth();
  const [booking, setBooking] = useState<IBooking | undefined>();
  const [hasPrivilegedAccess, setHasPrivilegedAccess] = useState(false);

  const loadBooking = async () => {
    const bookingId = params.id;
    const booking = await getBookingById(bookingId);
    setBooking(booking);
  };

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }
    loadBooking();
    setHasPrivilegedAccess(_hasPrivilegedAccess(loggedInAccount));
  }, [loggedInAccount]);

  const handleCheckInError = (e) => {
    const axiosError = getAxiosError(e);
    // not an HTTP error
    const errorMessage = axiosError
      ? axiosError.message
      : 'Something went wrong.';
    api.error({
      message: 'Check In Failed',
      description: errorMessage,
    });
  };
  const checkInBookingPassenger = async (bookingPassengerId: number) => {
    if (booking === undefined) {
      return;
    }

    try {
      await checkInPassenger(booking.id, bookingPassengerId);
      api.success({
        message: 'Check In Success',
        description: 'The selected passenger has checked in successfully.',
      });
    } catch (e) {
      handleCheckInError(e);
    }

    loadBooking();
  };

  const checkInBookingVehicle = async (bookingVehicleId: number) => {
    if (booking === undefined) {
      return;
    }

    try {
      await checkInVehicle(booking.id, bookingVehicleId);
      api.success({
        message: 'Check In Success',
        description: 'The selected vehicle has checked in successfully.',
      });
    } catch (e) {
      handleCheckInError(e);
    }

    loadBooking();
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Booking Summary</Title>
      <BookingSummary
        booking={booking}
        titleLevel={2}
        hasPrivilegedAccess={hasPrivilegedAccess}
        onCheckInPassenger={checkInBookingPassenger}
        onCheckInVehicle={checkInBookingVehicle}
      />
      {contextHolder}
    </div>
  );
}
