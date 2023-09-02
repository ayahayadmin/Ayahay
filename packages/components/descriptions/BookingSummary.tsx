import { Descriptions, Skeleton, Typography, Grid } from 'antd';
import { IBooking } from '@ayahay/models/booking.model';
import React from 'react';
import PassengerSummary from './PassengerSummary';

const { useBreakpoint } = Grid;
const { Title } = Typography;

interface BookingSummaryProps {
  booking?: IBooking;
}

export default function BookingSummary({ booking }: BookingSummaryProps) {
  const screens = useBreakpoint();

  return (
    <Skeleton loading={booking === undefined} active>
      {booking &&
        booking.bookingPassengers &&
        booking.bookingPassengers.map(
          ({ passenger, cabin, seat, meal, totalPrice }, index) => (
            <article key={index} style={{ margin: '16px 0' }}>
              {index === 0 && <Title level={3}>You</Title>}
              {index > 0 && <Title level={3}>Companion {index}</Title>}
              <div>
                <Title level={4}>Personal Information</Title>
                <PassengerSummary passenger={passenger} />
              </div>
              <div>
                <Title level={4}>Booking Information</Title>
                {cabin && (
                  <Descriptions
                    bordered={screens.sm}
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                    style={{ margin: '16px 0' }}
                  >
                    {seat && (
                      <Descriptions.Item label='Seat'>
                        {seat?.name}
                      </Descriptions.Item>
                    )}
                    {seat && (
                      <Descriptions.Item label='Seat Type'>
                        {seat?.seatType?.name}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label='Cabin'>
                      {cabin.name}
                    </Descriptions.Item>
                    <Descriptions.Item label='Meal'>
                      {meal ?? 'None'}
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </div>
            </article>
          )
        )}
      {booking &&
        booking.bookingVehicles &&
        booking.bookingVehicles.map(({ vehicle, totalPrice }, index) => (
          <article key={index}>
            <Title level={3}>Vehicle {index + 1}</Title>
            <Descriptions
              bordered
              column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            >
              <Descriptions.Item label='Plate Number'>
                {vehicle.plateNo}
              </Descriptions.Item>
              <Descriptions.Item label='Model Name'>
                {vehicle.modelName}
              </Descriptions.Item>
              <Descriptions.Item label='Model Year Manufactured'>
                {vehicle.modelYear}
              </Descriptions.Item>
              <Descriptions.Item label='Model Body'>
                {vehicle.vehicleType?.name}
              </Descriptions.Item>
            </Descriptions>
          </article>
        ))}
      {booking && booking.paymentItems && (
        <article id='payment-summary' style={{ maxWidth: '512px' }}>
          <Title level={3}>Payment Summary</Title>

          <Descriptions bordered column={{ xxl: 1 }}>
            {booking.paymentItems.map((paymentItem) => (
              <Descriptions.Item label={paymentItem.description}>
                ₱{paymentItem.price}
              </Descriptions.Item>
            ))}
            <Descriptions.Item label='Total' style={{ fontWeight: 600 }}>
              ₱{booking.totalPrice}
            </Descriptions.Item>
          </Descriptions>
        </article>
      )}
    </Skeleton>
  );
}
