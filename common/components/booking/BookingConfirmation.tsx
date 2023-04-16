import Booking from '@/common/models/booking.model';
import React from 'react';
import BookingSummary from '@/common/components/booking/BookingSummary';
import { Button, Typography } from 'antd';

const { Title } = Typography;

interface BookingConfirmationProps {
  booking?: Booking;
  onSuccess?: () => void;
  onPreviousStep?: () => void;
}

export default function BookingConfirmation({
  booking,
  onPreviousStep,
}: BookingConfirmationProps) {
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
          <Button type='primary' onClick={() => payBooking()}>
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
