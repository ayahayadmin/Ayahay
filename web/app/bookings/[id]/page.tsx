'use client';
import styles from './page.module.scss';
import React, { useEffect, useState } from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { getBookingById } from '@/services/booking.service';
import { IBooking } from '@ayahay/models/booking.model';
import { Button, notification, Typography } from 'antd';
import {
  cancelBooking,
  checkInPassenger,
  checkInVehicle,
} from '@ayahay/services/booking.service';
import { getAxiosError } from '@ayahay/services/error.service';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;

const textCenter = { textAlign: 'center' };
const noPadding = { padding: '0' };

export default function GetBooking({ params }) {
  const [api, contextHolder] = notification.useNotification();
  const { loggedInAccount, hasPrivilegedAccess } = useAuth();
  const [booking, setBooking] = useState<IBooking | undefined>();
  const [errorCode, setErrorCode] = useState<number | undefined>();

  const loadBooking = async () => {
    const bookingId = params.id;
    try {
      const booking = await getBookingById(bookingId);
      setBooking(booking);
      setErrorCode(undefined);
    } catch (e) {
      const axiosError = getAxiosError(e);
      if (axiosError === undefined) {
        setErrorCode(500);
      } else {
        setErrorCode(axiosError.statusCode);
      }
    }
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
    const axiosError = getAxiosError<string>(e);
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
      {errorCode === undefined && (
        <>
          <Title level={1}>Booking Summary</Title>
          <BookingSummary
            booking={booking}
            titleLevel={2}
            hasPrivilegedAccess={hasPrivilegedAccess}
            onCancelBooking={onCancelBooking}
            onCheckInPassenger={checkInBookingPassenger}
            onCheckInVehicle={checkInBookingVehicle}
          />
        </>
      )}
      {errorCode === 404 && (
        <p style={textCenter}>
          The booking does not exist. Try again after a few minutes or&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=Booking Not Found`}
            style={noPadding}
          >
            contact us for assistance
          </Button>
          .
        </p>
      )}
      {errorCode === 403 && (
        <p style={textCenter}>
          You are not authorized to view this booking.&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=I cannot access my booking`}
            style={noPadding}
          >
            Contact us for assistance
          </Button>
          &nbsp; if you think this is a mistake.
        </p>
      )}
      {errorCode === 500 && <p style={textCenter}>Something went wrong.</p>}
      {contextHolder}
    </div>
  );
}
