import React, { useEffect, useState } from 'react';
import { Skeleton, Grid, Button, notification, Badge } from 'antd';
import { IBookingPassenger } from '@ayahay/models';
import { DISCOUNT_TYPE } from '@ayahay/constants/enum';
import Table, { ColumnsType } from 'antd/es/table';
import { useLoggedInAccount } from '@ayahay/hooks/auth';
import { checkInPassenger } from '@ayahay/services/booking.service';
import dayjs from 'dayjs';
import 'dayjs/plugin/relativeTime';

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

interface PassengersSummaryProps {
  passengers?: IBookingPassenger[];
  allowCheckIn: boolean;
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
  allowCheckIn,
}: PassengersSummaryProps) {
  const [api, contextHolder] = notification.useNotification();
  const { loggedInAccount } = useLoggedInAccount();
  const [passengerColumns, setPassengerColumns] = useState<
    ColumnsType<PassengerInformation>
  >(passengerColumnsWithoutActions);
  const [passengerRows, setPassengerRows] = useState<PassengerInformation[]>(
    []
  );

  const onCheckIn = async (passenger: PassengerInformation) => {
    try {
      await checkInPassenger(passenger.bookingId, passenger.key);
      const updatedPassengerRows = passengerRows.map((oldPassenger) => {
        if (oldPassenger.key === passenger.key) {
          oldPassenger.checkInDate = new Date().toISOString();
          return oldPassenger;
        }
        return oldPassenger;
      });
      setPassengerRows(updatedPassengerRows);

      api.success({
        message: 'Check In Success',
        description: 'The selected passenger has checked in successfully.',
      });
    } catch (e) {
      api.error({
        message: 'Check In Failed',
        description: 'The selected passenger has already checked in.',
      });
    }
  };

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

    if (
      !allowCheckIn ||
      loggedInAccount === undefined ||
      loggedInAccount.role === 'Passenger'
    ) {
      return;
    }

    setPassengerColumns([
      ...passengerColumnsWithoutActions,
      {
        title: 'Check-In Status',
        render: (_, passenger) => {
          if (passenger.checkInDate === undefined) {
            return (
              <Button type='primary' onClick={() => onCheckIn(passenger)}>
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
  }, [loggedInAccount, passengers]);

  return (
    <Skeleton loading={passengers === undefined} active>
      {passengers && passengers.length > 0 && (
        <Table
          columns={passengerColumns}
          dataSource={passengerRows}
          pagination={false}
          tableLayout='fixed'
        ></Table>
      )}
      {contextHolder}
    </Skeleton>
  );
}

interface PassengerInformation {
  key: number;
  bookingId: number;
  name: string;
  discountType: DISCOUNT_TYPE | 'Adult';
  cabinTypeName: string;
  checkInDate?: string;
}
