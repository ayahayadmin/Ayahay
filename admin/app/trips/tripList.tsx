import React, { useEffect, useState } from 'react';
import { ITrip } from '@ayahay/models/trip.model';
import { Button, Skeleton } from 'antd';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import { IPort } from '@ayahay/models/port.model';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { getTripsByDateRange } from '@/services/trip.service';
import Table, { ColumnsType } from 'antd/es/table';
import CabinAndVehicleEditCapacity from '@/components/form/CabinAndVehicleEditCapacity';
import {
  getFullDate,
  getLocaleTimeString,
} from '@ayahay/services/date.service';
import { TripSearchByDateRange } from '@ayahay/http';
import { isEmpty } from 'lodash';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const columns: ColumnsType<ITrip> = [
  {
    key: 'logo',
    dataIndex: 'shippingLine',
    render: (text: IShippingLine) => (
      <img src='/assets/aznar-logo.png' alt={`${text.name} Logo`} height={80} />
    ),
    align: 'center',
  },
  {
    title: 'Origin',
    key: 'srcPort',
    dataIndex: 'srcPort',
    render: (text: IPort) => <span>{text.name}</span>,
  },
  {
    title: 'Destination',
    key: 'destPort',
    dataIndex: 'destPort',
    render: (text: IPort) => <span>{text.name}</span>,
  },
  {
    title: 'Departure Date',
    key: 'departureDateIso',
    dataIndex: 'departureDateIso',
    render: (departureDate: string) => (
      <div>
        <span>{getFullDate(departureDate)}</span>
        <br></br>
        <span>{getLocaleTimeString(departureDate)}</span>
      </div>
    ),
  },
  {
    title: 'Manifest',
    render: (_, record: ITrip) => (
      <Button
        type='primary'
        href={`/trips/${record.id}/manifest`}
        target='_blank'
      >
        View
      </Button>
    ),
  },
];

const adminOnlyColumns = [
  {
    title: 'Reporting',
    render: (_, record: ITrip) => (
      <Button
        type='primary'
        href={`/trips/${record.id}/reporting`}
        target='_blank'
      >
        Generate
      </Button>
    ),
  },
  {
    title: 'Capacities',
    key: 'editCapacities',
    render: (text: string, record: ITrip) => (
      <div>
        <CabinAndVehicleEditCapacity
          tripId={record.id}
          cabins={record.availableCabins}
          vehicleCapacity={record.vehicleCapacity}
        />
      </div>
    ),
  },
];

interface TripListProps {
  searchQuery: TripSearchByDateRange | undefined;
  hasAdminPrivileges: boolean;
}

export default function TripList({
  searchQuery,
  hasAdminPrivileges,
}: TripListProps) {
  const [tripsData, setTripsData] = useState([] as ITrip[]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, [searchQuery]);

  const fetchTrips = async () => {
    setLoading(true);
    // if no startDate and endDate was provided
    if (isEmpty(searchQuery)) {
      return;
    }
    const trips = await getTripsByDateRange(
      searchQuery.startDate,
      searchQuery.endDate
    );
    setTripsData(trips);
    setLoading(false);
  };

  return (
    <Skeleton
      loading={loading}
      active
      title={false}
      paragraph={{
        rows: 5,
        width: ['98%', '98%', '98%', '98%', '98%'],
      }}
    >
      {tripsData && (
        <Table
          columns={
            hasAdminPrivileges ? [...columns, ...adminOnlyColumns] : columns
          }
          dataSource={tripsData}
          pagination={false}
        ></Table>
      )}
    </Skeleton>
  );
}
