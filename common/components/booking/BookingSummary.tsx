import { Descriptions, Skeleton, Typography } from 'antd';
import Trip from '@/common/models/trip.model';
import dayjs from 'dayjs';
import { CABIN_TYPE, SEAT_TYPE } from '@/common/constants/enum';
import Booking from '@/common/models/booking.model';

const { Title } = Typography;

interface BookingSummaryProps {
  booking?: Booking;
}

export default function BookingSummary({ booking }: BookingSummaryProps) {
  return (
    <Skeleton loading={booking === undefined} active>
      {booking &&
        booking.bookingPassengers &&
        booking.bookingPassengers.map(({ passenger }, index) => (
          <article key={index}>
            {index === 0 && <Title level={3}>You</Title>}
            {index > 0 && <Title level={3}>Companion {index}</Title>}
            <Descriptions bordered>
              <Descriptions.Item label='First Name'>
                {passenger?.firstName}
              </Descriptions.Item>
              <Descriptions.Item label='Last Name'>
                {passenger?.lastName}
              </Descriptions.Item>
              <Descriptions.Item label='Sex'>
                {passenger?.sex}
              </Descriptions.Item>
              <Descriptions.Item label='Civil Status'>
                {passenger?.civilStatus}
              </Descriptions.Item>
              <Descriptions.Item label='Birthday'>
                {dayjs(passenger?.birthdayIso).format('MMM D, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label='Address'>
                {passenger?.address}
              </Descriptions.Item>
              <Descriptions.Item label='Nationality'>
                {passenger?.nationality}
              </Descriptions.Item>
              <Descriptions.Item label='Seat Preference'>
                {SEAT_TYPE[passenger?.preferences?.seat]}
              </Descriptions.Item>
              <Descriptions.Item label='Cabin Preference'>
                {CABIN_TYPE[passenger?.preferences?.cabin]}
              </Descriptions.Item>
              <Descriptions.Item label='Meal Preference'>
                {passenger?.preferences?.meal}
              </Descriptions.Item>
            </Descriptions>
          </article>
        ))}
    </Skeleton>
  );
}
