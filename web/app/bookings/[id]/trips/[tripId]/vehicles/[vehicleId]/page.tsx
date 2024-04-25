'use client';
import React, { useEffect, useState } from 'react';
import { IBookingTripVehicle } from '@ayahay/models';
import { getBookingTripVehicleById } from '@/services/booking.service';
import { useAuth } from '@/contexts/AuthContext';
import { getAxiosError } from '@ayahay/services/error.service';
import styles from '@/app/bookings/[id]/page.module.scss';
import BookingTripVehicleSummary from '@ayahay/components/descriptions/BookingTripVehicleSummary';
import { Button, Modal, notification, Typography } from 'antd';
import { checkInVehicle } from '@ayahay/services/booking.service';

const { Title } = Typography;

const textCenter = { textAlign: 'center' };
const noPadding = { padding: '0' };

export default function BookingTripVehiclePage({ params }) {
  const [api, notificationContext] = notification.useNotification();
  const [modal, modalContext] = Modal.useModal();
  const { loggedInAccount, hasPrivilegedAccess } = useAuth();
  const [bookingTripVehicle, setBookingTripVehicle] = useState<
    IBookingTripVehicle | undefined
  >();
  const [errorCode, setErrorCode] = useState<number | undefined>();

  const loadBookingTripVehicle = async () => {
    try {
      setBookingTripVehicle(
        await getBookingTripVehicleById(
          params.id,
          params.tripId,
          params.vehicleId
        )
      );
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
    loadBookingTripVehicle();
  }, [loggedInAccount]);

  const removeVehicle = async () => {
    if (bookingTripVehicle === undefined) {
      return;
    }

    try {
    } catch (e) {}
  };

  const checkInBookingVehicle = async () => {
    if (bookingTripVehicle === undefined) {
      return;
    }

    try {
      await checkInVehicle(
        bookingTripVehicle.bookingId,
        bookingTripVehicle.tripId,
        bookingTripVehicle.vehicleId
      );
      api.success({
        message: 'Check In Success',
        description: 'The selected vehicle has checked in successfully.',
      });
      loadBookingTripVehicle();
    } catch (e) {
      handleAxiosError(e, 'Check In Failed');
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

  return (
    <div className={styles['main-container']}>
      {errorCode === undefined && (
        <BookingTripVehicleSummary
          bookingTripVehicle={bookingTripVehicle}
          hasPrivilegedAccess={hasPrivilegedAccess}
          canCheckIn={
            hasPrivilegedAccess ||
            loggedInAccount?.role === 'ShippingLineScanner'
          }
          onRemoveVehicle={removeVehicle}
          onCheckInVehicle={checkInBookingVehicle}
        />
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
          &nbsp;if you think this is a mistake.
        </p>
      )}
      {errorCode === 500 && <p style={textCenter}>Something went wrong.</p>}
      {notificationContext}
      {modalContext}
    </div>
  );
}
