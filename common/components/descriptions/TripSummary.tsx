import { Descriptions, Skeleton, Typography } from 'antd';
import Trip from '@/common/models/trip.model';
import dayjs from 'dayjs';
import { TRIP_TYPE } from '@/common/constants/enum';

const { Title } = Typography;

interface TripSummaryProps {
  trip?: Trip;
}

export default function TripSummary({ trip }: TripSummaryProps) {
  return (
    <Skeleton loading={trip === undefined} active>
      {trip && (
        <Descriptions
          bordered
          column={{ xxl: 1, xl: 1, lg: 2, md: 2, sm: 2, xs: 1 }}
        >
          <Descriptions.Item label='Trip Type'>
            {TRIP_TYPE[trip.type]}
          </Descriptions.Item>
          <Descriptions.Item label='Origin Port'>
            {trip.srcPort.name}
          </Descriptions.Item>
          <Descriptions.Item label='Destination Port'>
            {trip.destPort.name}
          </Descriptions.Item>
          <Descriptions.Item label='Departure Date'>
            {dayjs(trip.departureDateIso).format('MMM D, YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label='Shipping Line'>
            {trip.shippingLine.name}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Skeleton>
  );
}
