'use client';
import styles from './page.module.scss';
import React, { useEffect, useState } from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { getBookingById } from '@/services/booking.service';
import { IBooking } from '@ayahay/models/booking.model';
import { Button, Modal, notification, Typography } from 'antd';
import {
  cancelBooking,
  checkInPassenger,
  checkInVehicle,
} from '@ayahay/services/booking.service';
import { getAxiosError } from '@ayahay/services/error.service';
import { useAuth } from '@/contexts/AuthContext';
import { startPaymentForBookingRequest } from '@/services/payment.service';
import { InfoCircleOutlined } from '@ant-design/icons';
import { BOOKING_CANCELLATION_TYPE } from '@ayahay/constants';

const { Title } = Typography;

const textCenter = { textAlign: 'center' };
const noPadding = { padding: '0' };

export default function BookingSummaryPage({ params }) {
  const [api, notificationContext] = notification.useNotification();
  const [modal, modalContext] = Modal.useModal();
  const { loggedInAccount, hasPrivilegedAccess } = useAuth();
  const [booking, setBooking] = useState<IBooking | undefined>();
  const [errorCode, setErrorCode] = useState<number | undefined>();

  const loadBooking = async () => {
    const bookingId = params.id;
    try {
      const booking = await getBookingById(bookingId);
      setBooking(booking);
      setErrorCode(undefined);
      if (
        !hasPrivilegedAccess &&
        booking?.bookingTrips?.[0]?.bookingTripVehicles &&
        booking?.bookingTrips?.[0]?.bookingTripVehicles.length > 0
      ) {
        modal.info({
          width: 'min(90vw, 512px)',
          centered: true,
          title: `IMPORTANT REMINDER`,
          icon: <InfoCircleOutlined />,
          content: (
            <p style={{ fontSize: '16px', fontWeight: '600' }}>
              PLEASE PRINT AND BRING THREE (3) COPIES OF THE BILL OF LADING
              (BOL) BEFORE COMING TO THE PORT.
            </p>
          ),
          okText: 'OK',
        });
      }
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

  const payBooking = async (): Promise<void> => {
    if (booking === undefined) {
      return;
    }

    const response = await startPaymentForBookingRequest(booking.id);
    if (response === undefined) {
      return;
    }

    informPaymentInitiation(response.paymentReference, response.redirectUrl);
    window.open(response.redirectUrl);
  };

  const informPaymentInitiation = (
    transactionId: string,
    redirectUrl: string
  ) => {
    modal.info({
      width: 'min(90vw, 512px)',
      centered: true,
      title: `You will be redirected to the secure PayMongo Payment Gateway to pay for your booking.`,
      icon: <InfoCircleOutlined />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p>
            For any concerns, please email us at it@ayahay.com with the subject
            header:
          </p>
          <p>
            <strong>Booking {transactionId.toUpperCase()}</strong>
          </p>
          <Button type='link' href={redirectUrl} target='_blank'>
            I was not redirected
          </Button>
        </div>
      ),
      okText: 'OK',
      onOk: () => window.location.reload(),
    });
  };

  const onCancelBooking = async (
    remarks: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ): Promise<void> => {
    if (booking === undefined) {
      return;
    }

    try {
      await cancelBooking(booking.id, remarks, reasonType);
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

  const checkInBookingPassenger = async (
    tripId: number,
    passengerId: number
  ) => {
    if (booking === undefined) {
      return;
    }

    try {
      await checkInPassenger(booking.id, tripId, passengerId);
      api.success({
        message: 'Check In Success',
        description: 'The selected passenger has checked in successfully.',
      });
      loadBooking();
    } catch (e) {
      handleAxiosError(e, 'Check In Failed');
    }
  };

  const checkInBookingVehicle = async (tripId: number, vehicleId: number) => {
    if (booking === undefined) {
      return;
    }

    try {
      await checkInVehicle(booking.id, tripId, vehicleId);
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
            canCheckIn={
              hasPrivilegedAccess ||
              loggedInAccount?.role === 'ShippingLineScanner'
            }
            showTripSummary={true}
            onPayBooking={payBooking}
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
      {notificationContext}
      {modalContext}
    </div>
  );
}
