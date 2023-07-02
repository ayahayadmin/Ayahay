import { Descriptions, Skeleton, Typography, Grid } from 'antd';
import { IBooking } from '@ayahay/models/booking.model';
import React from 'react';
import PassengerSummary from './PassengerSummary';
import { CABIN_TYPE, SEAT_TYPE, VEHICLE_BODY } from '@ayahay/constants/enum';

const {useBreakpoint} = Grid;
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
          ({ passenger, seat, meal, totalPrice }, index) => (
            <article key={index} style={{margin: '16px 0'}}>
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
                      bordered={screens.sm}
                      column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                      style={{margin: '16px 0'}}
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
                {VEHICLE_BODY[vehicle.modelBody]}
              </Descriptions.Item>
              <Descriptions.Item label='Price'>₱{totalPrice}</Descriptions.Item>
            </Descriptions>
          </article>
        ))}
    </Skeleton>
  );
}
