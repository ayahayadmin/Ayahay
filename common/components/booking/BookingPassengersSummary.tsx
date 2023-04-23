import { Descriptions, Skeleton, Typography } from 'antd';
import Booking from '@/common/models/booking.model';
import React from 'react';
import PassengerSummary from '@/common/components/descriptions/PassengerSummary';
import dayjs from 'dayjs';
import { CABIN_TYPE, SEAT_TYPE } from '@/common/constants/enum';

const { Title } = Typography;

interface BookingSummaryProps {
  booking?: Booking;
}

export default function BookingPassengersSummary({
  booking,
}: BookingSummaryProps) {
  return (
    <Skeleton loading={booking === undefined} active>
      {booking &&
        booking.bookingPassengers &&
        booking.bookingPassengers.map(
          ({ passenger, seat, meal, totalPrice }, index) => (
            <article key={index}>
              {index === 0 && <Title level={3}>You</Title>}
              {index > 0 && <Title level={3}>Companion {index}</Title>}
              <div>
                <Title level={4}>Personal Information</Title>
                <PassengerSummary passenger={passenger} />
              </div>
              <div>
                <Title level={4}>Booking Information</Title>
                <Skeleton loading={seat === undefined} active>
                  {seat && seat.cabin && (
                    <Descriptions
                      bordered
                      column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                    >
                      <Descriptions.Item label='Seat'>
                        {seat.name}
                      </Descriptions.Item>
                      <Descriptions.Item label='Seat Type'>
                        {SEAT_TYPE[seat.type]}
                      </Descriptions.Item>
                      <Descriptions.Item label='Cabin'>
                        {seat.cabin?.name}
                      </Descriptions.Item>
                      <Descriptions.Item label='Cabin Type'>
                        {CABIN_TYPE[seat.cabin.type]}
                      </Descriptions.Item>
                      <Descriptions.Item label='Meal'>{meal}</Descriptions.Item>
                      <Descriptions.Item label='Price'>
                        ₱{totalPrice}
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                </Skeleton>
              </div>
            </article>
          )
        )}
    </Skeleton>
  );
}
