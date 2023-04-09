import { Descriptions, Skeleton, Typography } from 'antd';
import Trip from '@/common/models/trip.model';
import dayjs from 'dayjs';

const { Title } = Typography;

interface TripSummaryProps {
  trip?: Trip;
}

export default function TripSummary({ trip }: TripSummaryProps) {
  return (
    <Skeleton loading={trip === undefined} active>
      {trip && (
        <Descriptions bordered>
          <Descriptions.Item label='Origin Port'>
            {trip.srcPort.name}
          </Descriptions.Item>
          <Descriptions.Item label='Destination Port'>
            {trip.destPort.name}
          </Descriptions.Item>
          <Descriptions.Item label='Departure Date'>
            {dayjs(trip.departureDateIso).format('MMM D, YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label='Negotiated Amount'>
            {trip.shippingLine.name}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Skeleton>
  );
}
