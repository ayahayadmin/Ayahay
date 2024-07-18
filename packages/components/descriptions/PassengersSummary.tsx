import React, { useEffect, useState } from 'react';
import { Button, Badge, Flex } from 'antd';
import { IBookingTripPassenger, IPassenger } from '@ayahay/models';
import { DISCOUNT_TYPE } from '@ayahay/constants/enum';
import Table, { ColumnsType } from 'antd/es/table';
import { ExportOutlined, EditOutlined } from '@ant-design/icons';
import UpdateTripPassengerModal from '../modals/UpdateTripPassengerModal';
import dayjs from 'dayjs';
import 'dayjs/plugin/relativeTime';

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

interface PassengersSummaryProps {
  passengers?: IBookingTripPassenger[];
  canCheckIn?: boolean;
  onCheckInPassenger?: (tripId: number, passengerId: number) => Promise<void>;
  onUpdatePassenger?: (
    tripId: number,
    passengerId: number,
    passenger: IPassenger
  ) => Promise<void>;
}

const passengerColumnsWithoutActions: ColumnsType<IBookingTripPassenger> = [
  {
    title: 'Name',
    render: (_, { passenger, discountType }) => {
      const name = `${passenger?.sex === 'Male' ? 'MR' : 'MS'} ${
        passenger?.firstName
      } ${passenger?.lastName}`;

      return (
        <div>
          <strong>{name}</strong>
          <p>{discountType ? DISCOUNT_TYPE[discountType] : 'Adult'}</p>
        </div>
      );
    },
  },
  {
    title: 'Cabin',
    key: 'cabinTypeName',
    render: (_, bookingTripPassenger) =>
      bookingTripPassenger.cabin?.cabinType?.name ?? '',
  },
];

export default function PassengersSummary({
  passengers,
  canCheckIn,
  onCheckInPassenger,
  onUpdatePassenger,
}: PassengersSummaryProps) {
  const [passengerModalOpen, setPassengerModalOpen] = useState<boolean>(false);
  const [selectedTripPassenger, setSelectedTripPassenger] = useState<
    IBookingTripPassenger | undefined
  >();
  const [passengerColumns, setPassengerColumns] = useState<
    ColumnsType<IBookingTripPassenger>
  >(passengerColumnsWithoutActions);

  useEffect(() => {
    if (onCheckInPassenger === undefined || !canCheckIn) {
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
                onClick={() =>
                  onCheckInPassenger(passenger.tripId, passenger.passengerId)
                }
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
      {
        title: 'Actions',
        render: (_, passenger) => (
          <Flex gap={8}>
            {onUpdatePassenger && (
              <Button
                type='primary'
                onClick={() => {
                  setSelectedTripPassenger(passenger);
                  setPassengerModalOpen(true);
                }}
                icon={<EditOutlined />}
              />
            )}
            <Button
              type='default'
              href={`/bookings/${passenger.bookingId}/trips/${passenger.tripId}/passengers/${passenger.passengerId}`}
              target='_blank'
              icon={<ExportOutlined />}
            />
          </Flex>
        ),
      },
    ]);
  }, [passengers]);

  const updateTripPassenger = async (passenger: IPassenger): Promise<void> => {
    if (!selectedTripPassenger || !onUpdatePassenger) {
      return;
    }
    await onUpdatePassenger(
      selectedTripPassenger.tripId,
      selectedTripPassenger.passengerId,
      passenger
    );
    setPassengerModalOpen(false);
  };

  return (
    <>
      <Table
        columns={passengerColumns}
        dataSource={passengers}
        pagination={false}
        loading={passengers === undefined}
        tableLayout='fixed'
      ></Table>
      {onUpdatePassenger && (
        <UpdateTripPassengerModal
          open={passengerModalOpen}
          originalTripPassenger={selectedTripPassenger}
          onUpdatePassenger={(passenger) => updateTripPassenger(passenger)}
          onCancel={() => setPassengerModalOpen(false)}
          width={300}
        />
      )}
    </>
  );
}
