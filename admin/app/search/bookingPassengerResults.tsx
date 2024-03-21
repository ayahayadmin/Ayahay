import { Badge, Button, Table } from 'antd';
import React, { useEffect } from 'react';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/plugin/relativeTime';
import { useServerPagination } from '@ayahay/hooks';
import {
  PaginatedRequest,
  PaginatedResponse,
  PassengerBookingSearchResponse,
} from '@ayahay/http';
import { searchPassengerBookings } from '@/services/booking.service';

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

interface BookingPassengerResultsProps {
  query: string;
}

export default function BookingPassengerResults({
  query,
}: BookingPassengerResultsProps) {
  const fetchSearchResults = async (
    pagination: PaginatedRequest
  ): Promise<PaginatedResponse<PassengerBookingSearchResponse>> => {
    if (query.trim().length < 2) {
      return { data: [], total: 0 };
    }
    return searchPassengerBookings(query.trim(), pagination);
  };

  const { dataInPage, antdPagination, antdOnChange, resetData } =
    useServerPagination<PassengerBookingSearchResponse>(
      fetchSearchResults,
      true
    );

  useEffect(() => resetData(), [query]);

  const columns: ColumnsType<PassengerBookingSearchResponse> = [
    {
      key: 'trip',
      title: 'Trip',
      render: (_, passengerBooking) => (
        <div>
          {passengerBooking.tripSrcPortName} -&gt;&nbsp;
          {passengerBooking.tripDestPortName}
          <br />
          {dayjs(passengerBooking.tripDepartureDateIso).format(
            'MM/DD/YYYY hh:mm'
          )}
        </div>
      ),
    },
    {
      key: 'passengerName',
      title: 'Passenger',
      render: (_, passengerBooking) =>
        `${passengerBooking.firstName} ${passengerBooking.lastName}`,
    },
    {
      key: 'referenceNo',
      dataIndex: 'referenceNo',
      title: 'Reference Number',
    },
    {
      dataIndex: 'checkInDateIso',
      key: 'checkInDateIso',
      title: 'Check-In Status',
      render: (checkInDate) => {
        if (checkInDate === undefined) {
          return <Badge status='default' text='Not checked in' />;
        }
        const checkInDateFromNow = dayjs(checkInDate).fromNow();

        return (
          <Badge status='success' text={`Checked in ${checkInDateFromNow}`} />
        );
      },
    },
    {
      title: 'Actions',
      render: (_, passengerBooking) => {
        return (
          <Button
            type='primary'
            href={`${process.env.NEXT_PUBLIC_WEB_URL}/bookings/${passengerBooking.bookingId}`}
            target='_blank'
          >
            View Booking
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataInPage}
        loading={dataInPage === undefined}
        pagination={antdPagination}
        onChange={antdOnChange}
      ></Table>
    </div>
  );
}
