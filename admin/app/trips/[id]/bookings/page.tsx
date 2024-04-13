'use client';
import { useAuthGuard } from '@/hooks/auth';
import { getBookingsOfTrip } from '@/services/trip.service';
import styles from './page.module.scss';
import { ColumnsType } from 'antd/es/table';
import { CarOutlined } from '@ant-design/icons';
import { Button, Popover, Table, Typography } from 'antd';
import { PaginatedRequest, VehicleBookings } from '@ayahay/http';
import { BookedVehiclesModal } from '@/components/modal/BookedVehiclesModal';
import { useServerPagination } from '@ayahay/hooks';

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
  const tripId = params.id;

  const fetchBookings = async (pagination: PaginatedRequest) => {
    return getBookingsOfTrip(Number(tripId), pagination);
  };

  const { dataInPage, antdPagination, antdOnChange } =
    useServerPagination<VehicleBookings>(fetchBookings, true);

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
