import { IBooking } from '@ayahay/models/booking.model';
import React from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { Button, notification, Typography } from 'antd';
import { startPaymentForBooking } from '@/services/payment.service';

const { Title } = Typography;

interface BookingConfirmationProps {
  tentativeBooking?: IBooking;
  onStartPayment?: (tentativeBookingId: number) => void;
  onPreviousStep?: () => void;
}

export default function BookingConfirmation({
  tentativeBooking,
  onPreviousStep,
  onStartPayment,
}: BookingConfirmationProps) {
  const onClickPay = async () => {
    if (tentativeBooking === undefined) {
      return;
    }
    onStartPayment && onStartPayment(tentativeBooking.id);
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
