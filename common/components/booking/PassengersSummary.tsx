import { Descriptions, Skeleton, Typography } from 'antd';
import Trip from '@/common/models/trip.model';
import dayjs from 'dayjs';
import Passenger from '@/common/models/passenger';
import { CABIN_TYPE, SEAT_TYPE } from '@/common/constants/enum';

const { Title } = Typography;

interface PassengersSummaryProps {
  passengers?: (Passenger | any)[];
}

export default function PassengersSummary({
  passengers,
}: PassengersSummaryProps) {
  return (
    <Skeleton loading={passengers === undefined} active>
      {passengers &&
        passengers.map((passenger, index) => (
          <article key={index}>
            {index === 0 && <Title level={3}>You</Title>}
            {index > 0 && <Title level={3}>Companion {index}</Title>}
            <Descriptions bordered>
              <Descriptions.Item label='First Name'>
                {passenger.firstName}
              </Descriptions.Item>
              <Descriptions.Item label='Last Name'>
                {passenger.lastName}
              </Descriptions.Item>
              <Descriptions.Item label='Sex'>{passenger.sex}</Descriptions.Item>
              <Descriptions.Item label='Civil Status'>
                {passenger.civilStatus}
              </Descriptions.Item>
              <Descriptions.Item label='Birthday'>
                {dayjs(passenger.birthdayIso).format('MMM D, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label='Address'>
                {passenger.address}
              </Descriptions.Item>
              <Descriptions.Item label='Nationality'>
                {passenger.nationality}
              </Descriptions.Item>
              <Descriptions.Item label='Seat Preference'>
                {SEAT_TYPE[passenger.preferences.seat]}
              </Descriptions.Item>
              <Descriptions.Item label='Cabin Preference'>
                {CABIN_TYPE[passenger.preferences.cabin]}
              </Descriptions.Item>
              <Descriptions.Item label='Meal Preference'>
                {passenger.preferences.meal}
              </Descriptions.Item>
            </Descriptions>
          </article>
        ))}
    </Skeleton>
  );
}
