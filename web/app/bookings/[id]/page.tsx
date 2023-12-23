'use client';
import styles from './page.module.scss';
import React, { useEffect, useState } from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { getBookingById } from '@/services/booking.service';
import { IBooking } from '@ayahay/models/booking.model';
import { notification, Typography } from 'antd';
import {
  cancelBooking,
  checkInPassenger,
  checkInVehicle,
} from '@ayahay/services/booking.service';
import { getAxiosError } from '@ayahay/services/error.service';
import { useAuth } from '@/app/contexts/AuthContext';

const { Title } = Typography;

export default function GetBooking({ params }) {
  const [api, contextHolder] = notification.useNotification();
  const { loggedInAccount, hasPrivilegedAccess } = useAuth();
  const [booking, setBooking] = useState<IBooking | undefined>();

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
  }, [loggedInAccount]);

  const onCancelBooking = async (remarks: string): Promise<void> => {
    if (booking === undefined) {
      return;
    }

    try {
      await cancelBooking(booking.id, remarks);
      api.success({
        message: 'Booking Cancellation Success',
        description: 'The booking has been cancelled successfully.',
      });
      loadBooking();
    } catch (e) {
      handleAxiosError(e, 'Cancellation Failed');
    }
  };

  const handleAxiosError = (e: any, errorTitle: string) => {
    const axiosError = getAxiosError(e);
    // not an HTTP error
    const errorMessage = axiosError
      ? axiosError.message
      : 'Something went wrong.';
    api.error({
      message: errorTitle,
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
      loadBooking();
    } catch (e) {
      handleAxiosError(e, 'Check In Failed');
    }
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
      loadBooking();
    } catch (e) {
      handleAxiosError(e, 'Check In Failed');
    }
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Booking Summary</Title>
      <BookingSummary
        booking={booking}
        titleLevel={2}
        hasPrivilegedAccess={hasPrivilegedAccess}
        onCancelBooking={onCancelBooking}
        onCheckInPassenger={checkInBookingPassenger}
        onCheckInVehicle={checkInBookingVehicle}
      />
      {contextHolder}
    </div>
  );
}
