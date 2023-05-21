'use client';
import React, { useEffect, useState } from 'react';
import { ITrip, mockTrips } from '@ayahay/models/trip.model';
import { filter, find, map, split } from 'lodash';
import { getTime } from '@/services/search.service';
import { Button, Space, Table } from 'antd';
import { useRouter } from 'next/navigation';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import { IPort } from '@ayahay/models/port.model';
import Seats from '../../details/seats';
import { getBookingPassengersByTripId } from '@/services/booking.service';
import {
  IBooking,
  IPassenger,
  mockBookingPassengers,
  mockBookings,
} from '@/../packages/models';

const PAGE_SIZE = 10;
const rowDataInitial = {
  shipId: -1,
  cabinType: '',
  floor: '',
};

interface BookingListProps {
  id: number;
}

export default function BookingList({ params }: any) {
  const router = useRouter();
  const [passengersData, setPassengersData] = useState([] as IPassenger[]);
  // const [buttonClicked, setButtonClicked] = useState(false);
  const [rowData, setRowData] = useState({ ...rowDataInitial });

  const columns = [
    {
      title: 'Full Name',
      key: 'firstName',
      render: (text: any, record: any) => (
        <span>
          {record.lastName}, {record.firstName}
        </span>
      ),
    },
    {
      title: 'Occupation',
      key: 'occupation',
      dataIndex: 'occupation',
    },
    {
      title: 'Birthdate',
      key: 'birthdayIso',
      dataIndex: 'birthdayIso',
    },
  ];

  // {/* shipId=${record.ship.id}&cabinType=${record.ship.cabins[0].type}&floor=${record.ship.cabins[0].name} */}
  //           {/* router.push(
  //               `/admin/details?shipId=${record.ship.id}&cabinType=${record.ship.cabins[0].type}`
  //             ) */}
  useEffect(() => {
    //probably get all tripIds given date range?
    //for now, will assume we have only ONE tripId (cuz there could be many trips given a date)
    // const tripId = 1;
    // const bookingPassengers = getBookingPassengersByTripId(tripId); // still waiting for Carlos to update
    // console.log(bookingPassengers);

    const bookingsTemp = filter(mockBookings, { tripId: Number(params.id) }); //pretending this doesn't exists
    const bookingPassengers = map(bookingsTemp, (booking) => {
      return find(mockBookingPassengers, { bookingId: booking.id });
    });

    const passengers = map(
      bookingPassengers,
      (bookingPassenger) => bookingPassenger?.passenger!
    );
    setPassengersData(passengers);
  }, []);

  return (
    <div>
      <Table
        columns={columns}
        dataSource={passengersData}
        // className={styles.searchResult}
        pagination={false}
      ></Table>
      {/* {buttonClicked && <Seats rowData={rowData} />} */}
    </div>
  );
}
