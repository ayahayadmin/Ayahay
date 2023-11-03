'use client';
import styles from './page.module.scss';
import {
  getMyBookings,
  getSavedBookingsInBrowser,
} from '@/services/booking.service';
import { useLoggedInAccount } from '@ayahay/hooks/auth';
import { IBooking } from '@ayahay/models';
import { Button, Typography } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

const { Title } = Typography;

const bookingColumns: ColumnsType<IBooking> = [
  {
    title: 'Reference No',
    dataIndex: 'referenceNo',
    key: 'referenceNo',
  },
  {
    title: 'Route',
    render: (_, booking) =>
      `${booking.bookingPassengers?.[0]?.trip?.srcPort?.name} -> ${booking.bookingPassengers?.[0]?.trip?.destPort?.name}`,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    responsive: ['md'],
  },
  {
    title: 'Created At',
    dataIndex: 'createdAtIso',
    key: 'createdAtIso',
    render: (createdAtIso: string) => new Date(createdAtIso).toLocaleString(),
    responsive: ['lg'],
  },
  {
    title: 'Total Price',
    dataIndex: 'totalPrice',
    key: 'totalPrice',
    responsive: ['lg'],
  },
  {
    title: '# Passengers',
    render: (_, booking) => {
      return booking.bookingPassengers?.length;
    },
    responsive: ['lg'],
  },
  {
    title: 'Actions',
    render: (_, booking) => {
      return (
        <Button type='primary' href={`/bookings/${booking.id}`} target='_blank'>
          View Ticket
        </Button>
      );
    },
  },
];

export default function MyBookings() {
  const { loggedInAccount } = useLoggedInAccount();
  const [myBookings, setMyBookings] = useState<IBooking[] | undefined>();
  const [savedBookings, setSavedBookings] = useState<IBooking[] | undefined>();

  const loadMyBookings = async () => {
    const _myBookings = await getMyBookings();
    setMyBookings(_myBookings);
  };

  const loadSavedBookings = async () => {
    const savedBookingsInBrowser = await getSavedBookingsInBrowser();
    setSavedBookings(savedBookingsInBrowser);
  };

  useEffect(() => {
    loadSavedBookings();
  }, []);

  useEffect(() => {
    if (loggedInAccount === undefined) {
      return;
    }
    loadMyBookings();
  }, [loggedInAccount]);

  return (
    <div className={styles['main-container']}>
      <section>
        <Title level={1}>My Bookings</Title>
        <Table
          dataSource={myBookings}
          columns={bookingColumns}
          pagination={false}
          loading={myBookings === undefined}
          tableLayout='fixed'
          rowKey={(booking) => booking.id}
        />
      </section>
      <section>
        <Title level={2}>Saved in Browser</Title>
        <p>
          Warning: These bookings will disappear if the browser data is cleared.
        </p>
        <Table
          dataSource={savedBookings}
          columns={bookingColumns}
          pagination={false}
          loading={savedBookings === undefined}
          tableLayout='fixed'
          rowKey={(booking) => booking.id}
        />
      </section>
    </div>
  );
}
