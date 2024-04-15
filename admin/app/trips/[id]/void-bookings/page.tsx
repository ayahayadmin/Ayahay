'use client';
import { useAuthGuard } from '@/hooks/auth';
import { getTripDetails } from '@/services/trip.service';
import styles from './page.module.scss';
import { ColumnsType } from 'antd/es/table';
import { Divider, Radio, Spin, Table, Typography } from 'antd';
import { PaginatedRequest, VoidBookings } from '@ayahay/http';
import { useServerPagination } from '@ayahay/hooks';
import { useEffect, useState } from 'react';
import {
  getVoidBookingTripPassengers,
  getVoidBookingTripVehicles,
} from '@/services/reporting.service';
import { ITrip } from '@ayahay/models';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';
import { getLocaleTimeString } from '@ayahay/services/date.service';

const { Title } = Typography;

const voidBookingColumns: ColumnsType<VoidBookings> = [
  {
    title: 'Reference No',
    key: 'referenceNo',
    dataIndex: 'referenceNo',
    align: 'center',
  },
  {
    title: 'Original Price',
    key: 'originalPrice',
    dataIndex: 'price',
    align: 'center',
  },
  {
    title: 'Refund Type',
    key: 'refundType',
    dataIndex: 'refundType',
    align: 'center',
  },
];

export default function VoidBookingsPage({ params }: any) {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const [trip, setTrip] = useState<ITrip | undefined>();
  const [selectionType, setSelectionType] = useState<'passenger' | 'vehicle'>(
    'passenger'
  );
  const tripId = params.id;

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }
    fetchTrip(tripId);
  }, [loggedInAccount]);

  const fetchTrip = async (tripId: number): Promise<void> => {
    setTrip(await getTripDetails(Number(tripId)));
  };

  useEffect(() => resetData(), [selectionType]);

  const fetchVoidBookings = async (pagination: PaginatedRequest) => {
    if (selectionType === 'passenger') {
      return getVoidBookingTripPassengers(Number(tripId), pagination);
    }
    return getVoidBookingTripVehicles(Number(tripId), pagination);
  };

  const { dataInPage, antdPagination, antdOnChange, resetData } =
    useServerPagination<VoidBookings>(fetchVoidBookings, true);

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Void Bookings</Title>
      <Spin
        size='large'
        spinning={trip === undefined}
        className={styles['spinner']}
      />
      {trip && (
        <>
          <div>
            <strong>Trip:</strong>&nbsp;{trip.srcPort?.name}&nbsp;to&nbsp;
            {trip.destPort?.name}
          </div>
          <div>
            <strong>Departure Date:</strong>&nbsp;
            {dayjs(trip.departureDateIso).format('MM/DD/YYYY')}&nbsp;at&nbsp;
            {getLocaleTimeString(trip.departureDateIso)}
          </div>
          <div>
            <strong>Voyage #:</strong>&nbsp;
            {trip.voyage?.number}
          </div>

          <Divider />

          <Radio.Group
            onChange={({ target: { value } }) => {
              setSelectionType(value);
            }}
            value={selectionType}
          >
            <Radio value='passenger'>Passenger</Radio>
            <Radio value='vehicle'>Vehicle</Radio>
          </Radio.Group>

          <Table
            columns={voidBookingColumns}
            dataSource={dataInPage}
            loading={dataInPage === undefined}
            pagination={antdPagination}
            onChange={antdOnChange}
          ></Table>
        </>
      )}
    </div>
  );
}
