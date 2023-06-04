import { Badge, Button, notification, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { ColumnsType } from 'antd/es/table';
import { getBookingPassengersFromQuery } from '@/services/booking-passenger.service';
import { TableRowSelection } from 'antd/es/table/interface';
import { checkInPassenger } from '@/services/booking.service';
import dayjs from 'dayjs';
import 'dayjs/plugin/relativeTime';

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

interface BookingPassengerResultsProps {
  query: string;
}

interface DataType {
  key: React.Key;
  id: number;
  tripSrcPortName: string;
  tripDestPortName: string;
  tripDepartureDateIso: string;
  passengerName: string;
  seatName: string;
  referenceNo: string;
  checkInDate: string | undefined;
}

export default function BookingPassengerResults({
  query,
}: BookingPassengerResultsProps) {
  const [api, contextHolder] = notification.useNotification();
  const [passengers, setPassengers] = useState<DataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const performSearch = () => {
    const bookingPassengers = getBookingPassengersFromQuery(query);
    setPassengers(
      bookingPassengers.map((bookingPassenger, index) => ({
        key: index,
        id: bookingPassenger.id,
        tripSrcPortName: bookingPassenger.booking?.trip?.srcPort?.name ?? '',
        tripDestPortName: bookingPassenger.booking?.trip?.destPort?.name ?? '',
        tripDepartureDateIso:
          bookingPassenger.booking?.trip?.departureDateIso ?? '',
        passengerName: `${bookingPassenger.passenger?.firstName ?? ''} ${
          bookingPassenger.passenger?.lastName
        }`,
        seatName: bookingPassenger.seat?.name ?? '',
        referenceNo: bookingPassenger.referenceNo,
        checkInDate: bookingPassenger.checkInDate,
      }))
    );
  };

  useEffect(performSearch, [query]);

  const onCheckIn = (passenger: DataType) => {
    const updatedPassenger = checkInPassenger(passenger.id);
    if (updatedPassenger === undefined) {
      api.error({
        message: 'Check In Failed',
        description: 'The selected passenger has already checked in.',
      });
    } else {
      api.success({
        message: 'Check In Success',
        description: 'The selected passenger has checked in successfully.',
      });
    }
    performSearch();
  };

  const columns: ColumnsType<DataType> = [
    {
      key: 'tripSrcPortName',
      dataIndex: 'tripSrcPortName',
      title: 'Origin Port',
    },
    {
      key: 'tripDestPortName',
      dataIndex: 'tripDestPortName',
      title: 'Destination Port',
    },
    {
      key: 'tripDepartureDateIso',
      dataIndex: 'tripDepartureDateIso',
      title: 'Departure Date',
    },
    {
      key: 'passengerName',
      dataIndex: 'passengerName',
      title: 'Passenger',
    },
    {
      key: 'seatName',
      dataIndex: 'seatName',
      title: 'Seat',
    },
    {
      key: 'referenceNo',
      dataIndex: 'referenceNo',
      title: 'Reference Number',
    },
    {
      dataIndex: 'checkInDate',
      key: 'checkInDate',
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
      render: (_, passenger) => {
        if (passenger.checkInDate !== undefined) {
          return <></>;
        }
        return (
          <Button type='primary' onClick={() => onCheckIn(passenger)}>
            Check In
          </Button>
        );
      },
    },
  ];

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys: selectedRowKeys,
    onChange: (_selectedRowKeys) => setSelectedRowKeys(_selectedRowKeys),
  };

  return (
    <div>
      {contextHolder}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={passengers}
      ></Table>
    </div>
  );
}
