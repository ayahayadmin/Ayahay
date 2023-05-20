import React, { useEffect, useState } from 'react';
import { ITrip, mockTrip, mockTrips } from '@ayahay/models/trip.model';
import { filter, find, map, split } from 'lodash';
import { getTime } from '@/services/search.service';
import { Button, Space, Table } from 'antd';
import { useRouter } from 'next/navigation';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import { IPort } from '@ayahay/models/port.model';
import Seats from '../details/seats';
import { getBookingPassengersByTripId } from '@/services/booking.service';
import {
  IBooking,
  IPassenger,
  mockBookingPassengers,
  mockBookings,
} from '@/../packages/models';
import BookingList from './[id]/page';

const PAGE_SIZE = 10;
const rowDataInitial = {
  shipId: -1,
  cabinType: '',
  floor: '',
};

export default function TripList() {
  //props: ShipId
  const shipId = 1;

  const router = useRouter();
  const [tripsData, setTripsData] = useState([] as ITrip[]);

  const columns = [
    {
      key: 'logo',
      dataIndex: 'shippingLine',
      render: (text: IShippingLine) => (
        <img
          src='/assets/logo-placeholder.png'
          alt={`${text.name} Logo`}
          height={80}
        />
      ),
    },
    {
      title: 'Shipping Line',
      key: 'shippingLine',
      dataIndex: 'shippingLine',
      render: (text: IShippingLine) => <span>{text.name}</span>,
    },
    {
      title: 'Origin',
      key: 'srcPort',
      dataIndex: 'srcPort',
      render: (text: IPort) => <span>{text.name}</span>,
    },
    {
      title: 'Destination',
      key: 'destPort',
      dataIndex: 'destPort',
      render: (text: IPort) => <span>{text.name}</span>,
    },
    {
      title: 'Departure Date',
      key: 'departureDate',
      dataIndex: 'departureDateIso',
      render: (text: string) => <span>{split(text, 'T')[0]}</span>,
    },
    {
      title: 'Departure Time',
      key: 'departureTime',
      dataIndex: 'departureDateIso',
      render: (text: string) => <span>{getTime(text)}</span>,
    },
    {
      title: 'Slots',
      key: 'slots',
      dataIndex: 'slots',
      render: (text: string) => <span>{`${text} slot/s`}</span>,
    },
  ];

  // {/* shipId=${record.ship.id}&cabinType=${record.ship.cabins[0].type}&floor=${record.ship.cabins[0].name} */}
  //           {/* router.push(
  //               `/admin/details?shipId=${record.ship.id}&cabinType=${record.ship.cabins[0].type}`
  //             ) */}
  useEffect(() => {
    //probably get all tripIds given date range? default date would always be today, then admin can extend range
    //for now, we hardcode tripIds (there could be many trips given a date)
    const tripIds = [1, 2];
    const trips = map(tripIds, (id) => {
      return find(mockTrips, { id })!;
    });

    setTripsData(trips);
  }, []);

  return (
    <div>
      <Table
        columns={columns}
        dataSource={tripsData}
        // className={styles.searchResult}
        onRow={(record, rowIdx) => {
          return {
            onClick: (event) => {
              router.push(`/schedules/${record.id}`);
            },
          };
        }}
        pagination={false}
      ></Table>
    </div>
  );
}
