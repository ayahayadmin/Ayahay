import { Badge, Button, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { ColumnsType } from 'antd/es/table';
import { IBookingPassenger } from '@/../packages/models';
import { getBookingPassengersFromQuery } from '@/services/booking-passenger.service';
import { TableRowSelection } from 'antd/es/table/interface';

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
  checkInStatus: 'Checked-In' | 'Not Checked-In';
}

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
    dataIndex: 'checkInStatus',
    key: 'checkInStatus',
    title: 'Check-In Status',
    render: (status) => {
      if (status === 'Checked-In') {
        return <Badge status='success' text='Checked-In' />;
      }
      return <Badge status='default' text='Not Checked-In' />;
    },
  },
  {
    title: 'Actions',
    render: (_, passenger) => {
      if (passenger.checkInStatus === 'Checked-In') {
        return <></>;
      }
      return <Button type='primary'>Check In</Button>;
    },
  },
];

export default function BookingPassengerResults({
  query,
}: BookingPassengerResultsProps) {
  const [passengers, setPassengers] = useState<DataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
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
        checkInStatus: bookingPassenger.checkInDate
          ? 'Checked-In'
          : 'Not Checked-In',
      }))
    );
  }, [query]);

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys: selectedRowKeys,
    onChange: (_selectedRowKeys) => setSelectedRowKeys(_selectedRowKeys),
  };

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={passengers}
    ></Table>
  );
}
