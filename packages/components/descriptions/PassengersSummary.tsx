import React, { useEffect, useState } from 'react';
import { Button, Badge } from 'antd';
import { IBookingPassenger } from '@ayahay/models';
import { DISCOUNT_TYPE } from '@ayahay/constants/enum';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/plugin/relativeTime';

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

interface PassengersSummaryProps {
  passengers?: IBookingPassenger[];
  hasPrivilegedAccess?: boolean;
  onCheckInPassenger?: (bookingPassengerId: number) => Promise<void>;
}

const passengerColumnsWithoutActions: ColumnsType<PassengerInformation> = [
  {
    title: 'Name',
    render: (_, passenger) => {
      return (
        <div>
          <strong>{passenger.name}</strong>
          <p>{passenger.discountType}</p>
        </div>
      );
    },
  },
  {
    title: 'Cabin',
    dataIndex: 'cabinTypeName',
    key: 'cabinTypeName',
  },
];

export default function PassengersSummary({
  passengers,
  hasPrivilegedAccess,
  onCheckInPassenger,
}: PassengersSummaryProps) {
  const [passengerColumns, setPassengerColumns] = useState<
    ColumnsType<PassengerInformation>
  >(passengerColumnsWithoutActions);
  const [passengerRows, setPassengerRows] = useState<PassengerInformation[]>(
    []
  );

  useEffect(() => {
    if (passengers === undefined) {
      setPassengerRows([]);
      return;
    }

    setPassengerRows(
      passengers.map(({ passenger, ...bookingPassenger }) => ({
        key: bookingPassenger.id,
        bookingId: bookingPassenger.bookingId,
        name: `${passenger?.sex === 'Male' ? 'MR' : 'MS'} ${
          passenger?.firstName
        } ${passenger?.lastName}`,
        discountType:
          passenger?.discountType === undefined
            ? 'Adult'
            : DISCOUNT_TYPE[passenger.discountType],
        cabinTypeName: bookingPassenger.cabin?.cabinType?.name ?? '',
        checkInDate: bookingPassenger.checkInDate,
      }))
    );

    if (onCheckInPassenger === undefined || !hasPrivilegedAccess) {
      return;
    }

    setPassengerColumns([
      ...passengerColumnsWithoutActions,
      {
        title: 'Check-In Status',
        render: (_, passenger) => {
          if (passenger.checkInDate === undefined) {
            return (
              <Button
                type='primary'
                onClick={() => onCheckInPassenger(passenger.key)}
              >
                Check In
              </Button>
            );
          }

          const checkInDateFromNow = dayjs(passenger.checkInDate).fromNow();
          return (
            <Badge status='success' text={`Checked in ${checkInDateFromNow}`} />
          );
        },
      },
    ]);
  }, [passengers]);

  return (
    <Table
      columns={passengerColumns}
      dataSource={passengerRows}
      pagination={false}
      loading={passengers === undefined}
      tableLayout='fixed'
    ></Table>
  );
}

interface PassengerInformation {
  key: number;
  bookingId: string;
  name: string;
  discountType: DISCOUNT_TYPE | 'Adult';
  cabinTypeName: string;
  checkInDate?: string;
}
