import React, { useEffect } from 'react';
import { ITrip } from '@ayahay/models/trip.model';
import { Button, Dropdown, Space } from 'antd';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { getAvailableTripsByDateRange } from '@/services/trip.service';
import Table, { ColumnsType } from 'antd/es/table';
import { getLocaleTimeString } from '@ayahay/services/date.service';
import { PaginatedRequest, PortsAndDateRangeSearch } from '@ayahay/http';
import EditCapacity from '@/components/form/EditCapacity';
import { ArrowRightOutlined, DownOutlined } from '@ant-design/icons';
import { useServerPagination } from '@ayahay/hooks';
import { useAuth } from '@/contexts/AuthContext';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface TripListProps {
  searchQuery: PortsAndDateRangeSearch | undefined;
  hasAdminPrivileges: boolean;
  onSetTripAsArrived: (tripId: number) => Promise<void>;
  onSetTripAsCancelled: (tripId: number) => Promise<void>;
}

const tripActions = (trip: ITrip): any[] => {
  const actions: any[] = [
    {
      label: (
        <a href={`/trips/${trip.id}/manifest?onboarded=false`} target='_blank'>
          View booked manifest
        </a>
      ),
      key: 'view-manifest',
    },
    {
      label: (
        <a href={`/trips/${trip.id}/manifest?onboarded=true`} target='_blank'>
          View onboarded manifest
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
        <a href={`/trips/${trip.id}/void-bookings`} target='_blank'>
          View void bookings
        </a>
      ),
      key: 'view-void-bookings',
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
  const { loggedInAccount } = useAuth();

  const onClickSetTripAsArrived = async (tripId: number) => {
    await onSetTripAsArrived(tripId);
    resetData();
  };

  const onClickSetTripAsCancelled = async (tripId: number) => {
    await onSetTripAsCancelled(tripId);
  };

  const columns: ColumnsType<ITrip> = [
    {
      key: 'logo',
      dataIndex: 'shippingLine',
      render: (shippingLine: IShippingLine) => (
        <img
          src={`/assets/shipping-line-logos/${shippingLine.name}.png`}
          alt='Logo'
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
          {record.srcPort!.name} <ArrowRightOutlined />
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
            {record.srcPort!.name} <ArrowRightOutlined />
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
      render: (_: string, record: ITrip) => (
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

  useEffect(() => resetData(), [searchQuery]);

  const fetchAvailableTripsByDateRange = async (
    pagination: PaginatedRequest
  ) => {
    return getAvailableTripsByDateRange(
      loggedInAccount?.shippingLineId,
      searchQuery,
      pagination
    );
  };

  const {
    dataInPage: availableTrips,
    antdPagination,
    antdOnChange,
    resetData,
  } = useServerPagination<ITrip>(
    fetchAvailableTripsByDateRange,
    loggedInAccount !== null && loggedInAccount !== undefined
  );

  return (
    <Table
      dataSource={availableTrips}
      columns={hasAdminPrivileges ? [...columns, ...adminOnlyColumns] : columns}
      pagination={antdPagination}
      onChange={antdOnChange}
      loading={availableTrips === undefined}
      tableLayout='fixed'
      rowKey={(trip) => trip.id}
    />
  );
}
