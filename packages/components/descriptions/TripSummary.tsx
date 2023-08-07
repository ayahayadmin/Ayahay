import { Descriptions, Skeleton, Typography, Grid } from 'antd';
import { ITrip } from '@ayahay/models';
import dayjs from 'dayjs';
import { useTripFromSearchParams } from '@ayahay/web/hooks/trip';

interface TripSummaryProps {
  trip?: ITrip;
}

const { useBreakpoint } = Grid;

export default function TripSummary({ trip }: TripSummaryProps) {
  const screens = useBreakpoint();
  return (
    <Skeleton loading={trip === undefined} active>
      {trip && (
        <Descriptions
          bordered={screens.sm}
          column={{ xxl: 1, xl: 1, lg: 2, md: 2, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label='Origin Port'>
            {trip?.srcPort?.name}
          </Descriptions.Item>
          <Descriptions.Item label='Destination Port'>
            {trip?.destPort?.name}
          </Descriptions.Item>
          <Descriptions.Item label='Departure Date'>
            {dayjs(trip?.departureDateIso).format('MMM D, YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label='Shipping Line'>
            {trip?.shippingLine?.name}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Skeleton>
  );
}
