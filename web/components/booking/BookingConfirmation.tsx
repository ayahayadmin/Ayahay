import { IBooking } from '@ayahay/models/booking.model';
import React from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { Button, Typography } from 'antd';
import { createBooking } from '@/services/booking.service';

const { Title } = Typography;

interface BookingConfirmationProps {
  booking?: IBooking;
  onSuccessfulPayment?: (booking: IBooking) => void;
  onPreviousStep?: () => void;
}

export default function BookingConfirmation({
  booking,
  onPreviousStep,
  onSuccessfulPayment,
}: BookingConfirmationProps) {
  const onClickPay = () => {
    if (booking === undefined) {
      return;
    }
    payBooking();
    const createdBooking = createBooking(booking);
    onSuccessfulPayment && onSuccessfulPayment(createdBooking);
  };

  // TODO: Payment logic
  const payBooking = () => {};

  return (
    <div>
      <Title level={2}>Confirm Booking</Title>
      {booking && <BookingSummary booking={booking} />}
      {!booking && (
        <p>
          Something went wrong. Please book again or contact a system
          administrator if the issue persists.
        </p>
      )}
      <div>
        {booking && (
          <Button type='primary' onClick={onClickPay}>
            Pay ₱{booking.totalPrice}
          </Button>
        )}
        <Button onClick={() => onPreviousStep && onPreviousStep()}>
          Book Again
        </Button>
      </div>
    </div>
  );
}
