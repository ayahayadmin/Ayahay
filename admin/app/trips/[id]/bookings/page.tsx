'use client';
import { useAuthGuard } from '@/hooks/auth';
import { getBookingsOfTrip } from '@/services/trip.service';
import { IBooking } from '@ayahay/models';
import styles from './page.module.scss';
import { ColumnsType } from 'antd/es/table';
import { CarOutlined } from '@ant-design/icons';
import { Button, Popover, Table, Typography } from 'antd';
import { PaginatedRequest } from '@ayahay/http';
import { BookedVehiclesModal } from '@/components/modal/BookedVehiclesModal';
import { useServerPagination } from '@ayahay/hooks';

const { Title } = Typography;

const bookingColumns: ColumnsType<IBooking> = [
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
    render: (_: string, record: IBooking) => {
      const vehicles = record.bookingVehicles!.map((bookingVehicle) => ({
        vehicleDescription: bookingVehicle.vehicle.vehicleType!.description,
        vehiclePrice: bookingVehicle.totalPrice!,
        checkedIn: bookingVehicle.hasOwnProperty('checkInDate') ? 'Yes' : 'No',
      }));

      return (
        <div>
          <Popover
            content={<BookedVehiclesModal vehicles={vehicles} />}
            trigger='click'
          >
            <Button type='text'>
              <CarOutlined rev={undefined} />
            </Button>
          </Popover>
        </div>
      );
    },
    align: 'center',
  },
];

export default function TripBookingsPage({ params }: any) {
  useAuthGuard(['Staff', 'Admin', 'SuperAdmin']);
  const tripId = params.id;

  const fetchBookings = async (pagination: PaginatedRequest) => {
    return getBookingsOfTrip(Number(tripId), pagination);
  };

  const { dataInPage, antdPagination, antdOnChange } =
    useServerPagination<IBooking>(fetchBookings, true);

  return (
    <div className={styles['main-container']}>
      <Title level={1}>Vehicle Bookings</Title>
      <Table
        columns={bookingColumns}
        dataSource={dataInPage}
        loading={dataInPage === undefined}
        pagination={antdPagination}
        onChange={antdOnChange}
        rowKey={(booking) => booking.id}
      ></Table>
    </div>
  );
}
