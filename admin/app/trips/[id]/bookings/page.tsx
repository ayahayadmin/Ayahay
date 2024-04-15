'use client';
import { useAuthGuard } from '@/hooks/auth';
import { getBookingsOfTrip, getTripDetails } from '@/services/trip.service';
import styles from './page.module.scss';
import { ColumnsType } from 'antd/es/table';
import { CarOutlined } from '@ant-design/icons';
import { Button, Divider, Popover, Spin, Table, Typography } from 'antd';
import { PaginatedRequest, VehicleBookings } from '@ayahay/http';
import { BookedVehiclesModal } from '@/components/modal/BookedVehiclesModal';
import { useServerPagination } from '@ayahay/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { ITrip } from '@ayahay/models';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { getLocaleTimeString } from '@ayahay/services/date.service';

const { Title } = Typography;

const bookingColumns: ColumnsType<VehicleBookings> = [
  {
    title: 'Reference No',
    key: 'referenceNo',
    dataIndex: 'referenceNo',
    align: 'center',
  },
  {
    title: 'Booking Price',
    key: 'bookingPrice',
    dataIndex: 'totalPrice',
    align: 'center',
  },
  {
    title: 'Vehicles',
    key: 'vehicles',
    render: (_: string, record: VehicleBookings) => {
      const vehicles = record.bookingTripVehicles!.map(
        (bookingTripVehicle) => ({
          vehicleDescription:
            bookingTripVehicle.vehicle!.vehicleType!.description,
          vehiclePrice: bookingTripVehicle.totalPrice!,
          checkedIn: bookingTripVehicle.hasOwnProperty('checkInDate')
            ? 'Yes'
            : 'No',
        })
      );

      return (
        <div>
          <Popover
            content={<BookedVehiclesModal vehicles={vehicles} />}
            trigger='click'
          >
            <Button type='text'>
              <CarOutlined />
            </Button>
          </Popover>
        </div>
      );
    },
    align: 'center',
  },
];

export default function TripBookingsPage({ params }: any) {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const [trip, setTrip] = useState<ITrip | undefined>();
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

  const fetchBookings = async (pagination: PaginatedRequest) => {
    return getBookingsOfTrip(Number(tripId), pagination);
  };

  const { dataInPage, antdPagination, antdOnChange } =
    useServerPagination<VehicleBookings>(fetchBookings, true);

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Vehicle Bookings</Title>
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
          <Table
            columns={bookingColumns}
            dataSource={dataInPage}
            loading={dataInPage === undefined}
            pagination={antdPagination}
            onChange={antdOnChange}
            rowKey={(booking) => booking.id}
          ></Table>
        </>
      )}
    </div>
  );
}
