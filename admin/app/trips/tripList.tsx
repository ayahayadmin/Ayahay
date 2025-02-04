import React, { useEffect, useState } from 'react';
import { ITrip } from '@ayahay/models/trip.model';
import { Button, Dropdown, Space, Switch } from 'antd';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  getAvailableTripsByDateRange,
  updateTripOnlineBooking,
} from '@/services/trip.service';
import Table, { ColumnsType } from 'antd/es/table';
import { PaginatedRequest, PortsAndDateRangeSearch } from '@ayahay/http';
import EditCapacity from '@/components/form/EditCapacity';
import { ArrowRightOutlined, DownOutlined } from '@ant-design/icons';
import { useServerPagination } from '@ayahay/hooks';
import { useAuth } from '@/contexts/AuthContext';
import CancelledTripModal from '@/components/modal/CancelledTripModal';
import { NotificationInstance } from 'antd/es/notification/interface';
import AssignVesselModal from '@/components/modal/AssignVesselModal';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(timezone);
dayjs.extend(utc);

interface TripListProps {
  searchQuery: PortsAndDateRangeSearch | undefined;
  hasAdminPrivileges: boolean;
  onSetTripAsArrived: (tripId: number) => Promise<void>;
  api: NotificationInstance;
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
          Disbursements
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

const tripAdminActions = (trip: ITrip): any[] => {
  const actions = [];

  if (trip.status === 'Awaiting') {
    actions.push({
      label: 'Assign Vessel',
      key: 'assign-vessel',
    });
  }

  return actions;
};

export default function TripList({
  searchQuery,
  hasAdminPrivileges,
  onSetTripAsArrived,
  api,
}: TripListProps) {
  const { loggedInAccount } = useAuth();
  const [tripId, setTripId] = useState(-1);
  const [shipId, setShipId] = useState(-1);
  const [srcPortName, setSrcPortName] = useState<string | undefined>();
  const [destPortName, setDestPortName] = useState<string | undefined>();
  const [isCancelTripModalOpen, setCancelTripModalOpen] = useState(false);
  const [isAssignVesselModalOpen, setAssignVesselModalOpen] = useState(false);

  const onClickSetTripAsArrived = async (tripId: number) => {
    await onSetTripAsArrived(tripId);
    resetData();
  };

  const onClickSetTripAsCancelled = async (tripId: number) => {
    setTripId(tripId);
    setCancelTripModalOpen(true);
  };

  const onClickAssignVessel = async (tripId: number, shipId: number) => {
    setTripId(tripId);
    setShipId(shipId);
    setAssignVesselModalOpen(true);
  };

  const onAllowOnlineBookingChange = async (
    tripId: number,
    checked: boolean
  ) => {
    await updateTripOnlineBooking(tripId, checked);
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
      render: (departureDateIso: string) => (
        <span>
          {dayjs(departureDateIso)
            .tz('Asia/Shanghai')
            .format('MM/DD/YYYY h:mm A')}
        </span>
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
          {dayjs(record.departureDateIso)
            .tz('Asia/Shanghai')
            .format('MM/DD/YYYY h:mm A')}
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
              } else if (key === 'assign-vessel') {
                setSrcPortName(trip.srcPort?.name);
                setDestPortName(trip.destPort?.name);
                onClickAssignVessel(trip.id, trip.shipId);
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

  const superAdminOnlyColumns = [
    {
      title: 'Online Booking',
      key: 'onlineBooking',
      render: (_: string, record: ITrip) => (
        <Switch
          defaultValue={record.allowOnlineBooking}
          onChange={(checked) => onAllowOnlineBookingChange(record.id, checked)}
        />
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
    <>
      <Table
        dataSource={availableTrips}
        columns={
          loggedInAccount?.role === 'SuperAdmin'
            ? [...columns, ...adminOnlyColumns, ...superAdminOnlyColumns]
            : hasAdminPrivileges
            ? [...columns, ...adminOnlyColumns]
            : columns
        }
        pagination={antdPagination}
        onChange={antdOnChange}
        loading={availableTrips === undefined}
        tableLayout='fixed'
        rowKey={(trip) => trip.id}
      />

      <CancelledTripModal
        tripId={tripId}
        setCancelTripModalOpen={setCancelTripModalOpen}
        api={api}
        resetData={resetData}
        open={isCancelTripModalOpen}
      />
      {srcPortName && destPortName && (
        <AssignVesselModal
          tripId={tripId}
          shipId={shipId}
          srcPortName={srcPortName}
          destPortName={destPortName}
          setAssignVesselModalOpen={setAssignVesselModalOpen}
          resetData={resetData}
          api={api}
          open={isAssignVesselModalOpen}
        />
      )}
    </>
  );
}
