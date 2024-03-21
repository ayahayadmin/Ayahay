import { getCancelledTrips } from '@/services/trip.service';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useServerPagination } from '@ayahay/hooks';
import {
  CancelledTrips,
  PaginatedRequest,
  TripSearchByDateRange,
} from '@ayahay/http';
import { IAccount } from '@ayahay/models';
import { getLocaleTimeString } from '@ayahay/services/date.service';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect } from 'react';

interface CanccelledTripListProps {
  searchQuery: TripSearchByDateRange | undefined;
  loggedInAccount: IAccount | null | undefined;
}

const columns: ColumnsType<CancelledTrips> = [
  {
    title: 'Route',
    key: 'srcDestPort',
    render: (_: string, record: CancelledTrips) => (
      <span>
        {record.srcPortName} <ArrowRightOutlined rev={undefined} />
        &nbsp;
        {record.destPortName}
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
    title: 'Vessel',
    key: 'vessel',
    dataIndex: 'shipName',
    align: 'center',
    responsive: ['sm'],
  },
  {
    title: 'Details',
    key: 'tripDetails',
    render: (_: string, record: CancelledTrips) => (
      <>
        <strong>Route:</strong>&nbsp;
        <span>
          {record.srcPortName} <ArrowRightOutlined rev={undefined} />
          &nbsp;
          {record.destPortName}
        </span>
        <br></br>
        <strong>Date:</strong>&nbsp;
        <span>{dayjs(record.departureDateIso).format('MM/DD/YYYY')}</span>
        <br></br>
        <span>{getLocaleTimeString(record.departureDateIso)}</span>
        <br></br>
        <strong>Vessel:</strong>&nbsp;<span>{record.shipName}</span>
      </>
    ),
    responsive: ['xs'],
  },
  {
    title: 'Cancellation Reason',
    key: 'cancellationReason',
    dataIndex: 'cancellationReason',
    align: 'center',
  },
];

export default function CancelledTripList({
  searchQuery,
  loggedInAccount,
}: CanccelledTripListProps) {
  useEffect(() => resetData(), [searchQuery]);

  const fetchCancelledTrips = async (pagination: PaginatedRequest) => {
    return getCancelledTrips(searchQuery, pagination);
  };

  const {
    dataInPage: cancelledTrips,
    antdPagination,
    antdOnChange,
    resetData,
  } = useServerPagination<CancelledTrips>(
    fetchCancelledTrips,
    loggedInAccount !== null && loggedInAccount !== undefined
  );

  return (
    <Table
      dataSource={cancelledTrips}
      columns={columns}
      pagination={antdPagination}
      onChange={antdOnChange}
      tableLayout='fixed'
      rowKey={(trip) =>
        `${trip.srcPortName}-${trip.destPortName}-${trip.departureDateIso}`
      }
    />
  );
}
