import Booking from '@/common/models/booking.model';
import React from 'react';
import BookingPassengersSummary from '@/common/components/booking/BookingPassengersSummary';
import { Button, Typography } from 'antd';
import { createBooking } from '@/common/services/booking.service';

const { Title } = Typography;

interface BookingConfirmationProps {
  booking?: Booking;
  onSuccessfulPayment?: (booking: Booking) => void;
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
      {booking && <BookingPassengersSummary booking={booking} />}
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
