import { IBooking } from '@ayahay/models/booking.model';
import React from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { Button, notification, Typography } from 'antd';
import { startPaymentForBooking } from '@/services/payment.service';

const { Title } = Typography;

interface BookingConfirmationProps {
  tentativeBooking?: IBooking;
  onSuccessfulPayment?: (booking: IBooking) => void;
  onPreviousStep?: () => void;
}

export default function BookingConfirmation({
  tentativeBooking,
  onPreviousStep,
  onSuccessfulPayment,
}: BookingConfirmationProps) {
  const onClickPay = async () => {
    if (tentativeBooking === undefined) {
      return;
    }
    await payBooking(tentativeBooking.id);
  };

  const payBooking = async (tentativeBookingId: number) => {
    try {
      const { data: createdBooking } = await startPaymentForBooking(
        tentativeBookingId
      );
      onSuccessfulPayment && onSuccessfulPayment(createdBooking);
    } catch (e) {
      onBookPaymentError(e);
    }
  };

  const onBookPaymentError = (e: any) => {
    notification.error({
      message: 'Something went wrong.',
      description:
        'There seems to be an issue with the payment. Please try again in a few minutes or contact us at help@ayahay.com for assistance.',
    });
    console.error(e);
  };

  return (
    <div>
      <Title level={2}>Confirm Booking</Title>
      {tentativeBooking && <BookingSummary booking={tentativeBooking} />}
      {!tentativeBooking && (
        <p>
          Something went wrong. Please book again or contact a system
          administrator if the issue persists.
        </p>
      )}
      <div>
        {tentativeBooking && (
          <Button type='primary' onClick={onClickPay}>
            Pay ₱{tentativeBooking.totalPrice}
          </Button>
        )}
        <Button onClick={() => onPreviousStep && onPreviousStep()}>
          Book Again
        </Button>
      </div>
    </div>
  );
}
