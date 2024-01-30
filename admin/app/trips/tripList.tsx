import React, { useEffect, useState } from 'react';
import { ITrip } from '@ayahay/models/trip.model';
import { Button, Dropdown, Skeleton, Space } from 'antd';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { getTripsByDateRange } from '@/services/trip.service';
import Table, { ColumnsType } from 'antd/es/table';
import {
  getFullDate,
  getLocaleTimeString,
} from '@ayahay/services/date.service';
import { TripSearchByDateRange } from '@ayahay/http';
import { isEmpty } from 'lodash';
import EditCapacity from '@/components/form/EditCapacity';
import { ArrowRightOutlined, DownOutlined } from '@ant-design/icons';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface TripListProps {
  searchQuery: TripSearchByDateRange | undefined;
  hasAdminPrivileges: boolean;
  onSetTripAsArrived: (tripId: number) => Promise<void>;
  onSetTripAsCancelled: (tripId: number) => Promise<void>;
}

const tripActions = (trip: ITrip): any[] => {
  const actions: any[] = [
    {
      label: (
        <a href={`/trips/${trip.id}/manifest`} target='_blank'>
          View manifest
        </a>
      ),
      key: 'view-manifest',
    },
    {
      label: (
        <a href={`/trips/${trip.id}/bookings`} target='_blank'>
          View vehicle bookings
        </a>
      ),
      key: 'view-vehicle-bookings',
    },
    {
      label: (
        <a href={`/trips/${trip.id}/disbursement`} target='_blank'>
          Input disbursements
        </a>
      ),
      key: 'input-disbursements',
    },
    {
      label: (
        <a href={`/trips/${trip.id}/reporting`} target='_blank'>
          Generate reports
        </a>
      ),
      key: 'generate-reports',
    },
  ];

  if (trip.status === 'Awaiting') {
    actions.push(
      ...[
        {
          label: 'Set status to Arrived',
          key: `set-arrived`,
        },
        {
          label: 'Set status to Cancelled',
          key: `set-cancelled`,
        },
      ]
    );
  }

  return actions;
};

const tripAdminActions = (trip: ITrip): any[] => [];

export default function TripList({
  searchQuery,
  hasAdminPrivileges,
  onSetTripAsArrived,
  onSetTripAsCancelled,
}: TripListProps) {
  const [tripsData, setTripsData] = useState([] as ITrip[]);
  const [loading, setLoading] = useState(false);

  const onClickSetTripAsArrived = async (tripId: number) => {
    await onSetTripAsArrived(tripId);
    fetchTrips();
  };

  const onClickSetTripAsCancelled = async (tripId: number) => {
    await onSetTripAsCancelled(tripId);
  };

  const columns: ColumnsType<ITrip> = [
    {
      key: 'logo',
      dataIndex: 'shippingLine',
      render: (text: IShippingLine) => (
        <img
          src='/assets/aznar-logo.png'
          alt={`${text.name} Logo`}
          height={80}
        />
      ),
      align: 'center',
      responsive: ['md'],
    },
    {
      title: 'Route',
      key: 'srcDestPort',
      render: (_: string, record: ITrip) => (
        <span>
          {record.srcPort!.name} <ArrowRightOutlined rev={undefined} />
          &nbsp;
          {record.destPort!.name}
        </span>
      ),
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Departure Date',
      key: 'departureDateIso',
      dataIndex: 'departureDateIso',
      render: (departureDate: string) => (
        <div>
          <span>{dayjs(departureDate).format('MM/DD/YYYY')}</span>
          <br></br>
          <span>{getLocaleTimeString(departureDate)}</span>
        </div>
      ),
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Details',
      key: 'tripDetails',
      render: (_: string, record: ITrip) => (
        <>
          <strong>Route:</strong>&nbsp;
          <span>
            {record.srcPort!.name} <ArrowRightOutlined rev={undefined} />
            &nbsp;
            {record.destPort!.name}
          </span>
          <br></br>
          <strong>Date:</strong>&nbsp;
          <span>{dayjs(record.departureDateIso).format('MM/DD/YYYY')}</span>
          <br></br>
          <span>{getLocaleTimeString(record.departureDateIso)}</span>
          <br></br>
          <strong>Status:</strong>&nbsp;<span>{record.status}</span>
        </>
      ),
      responsive: ['xs'],
    },
    {
      title: '',
      render: (_, trip: ITrip) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: hasAdminPrivileges
              ? [...tripActions(trip), ...tripAdminActions(trip)]
              : tripActions(trip),
            onClick: ({ key }) => {
              if (key === 'set-arrived') {
                onClickSetTripAsArrived(trip.id);
              } else if (key === 'set-cancelled') {
                onClickSetTripAsCancelled(trip.id);
              }
            },
          }}
        >
          <Button>
            <Space>
              Actions
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      ),
      align: 'center',
    },
  ];

  const adminOnlyColumns = [
    {
      title: 'Capacities',
      key: 'editCapacities',
      render: (text: string, record: ITrip) => (
        <div>
          <EditCapacity
            tripId={record.id}
            cabins={record.availableCabins}
            vehicleCapacity={record.vehicleCapacity}
          />
        </div>
      ),
    },
  ];

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
