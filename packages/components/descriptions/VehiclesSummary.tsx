import React, { useEffect, useState } from 'react';
import { Button, Badge, Flex } from 'antd';
import { IBookingTripVehicle, IVehicle } from '@ayahay/models';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { EditOutlined, ExportOutlined } from '@ant-design/icons';
import UpdateTripVehicleModal from '../modals/UpdateTripVehicleModal';

interface VehiclesSummaryProps {
  vehicles?: IBookingTripVehicle[];
  canCheckIn?: boolean;
  onCheckInVehicle?: (tripId: number, vehicleId: number) => Promise<void>;
  onUpdateVehicle?: (
    tripId: number,
    vehicleId: number,
    vehicle: IVehicle
  ) => Promise<void>;
}

const vehicleColumnsWithoutActions: ColumnsType<IBookingTripVehicle> = [
  {
    title: 'Name',
    render: (_, { vehicle }) => {
      return (
        <div>
          <strong>{vehicle?.plateNo}</strong>
          <p>{vehicle?.modelName}</p>
        </div>
      );
    },
  },
  {
    title: 'Type',
    key: 'vehicleTypeName',
    render: (_, { vehicle }) => vehicle?.vehicleType?.name,
  },
];

export default function VehiclesSummary({
  vehicles,
  canCheckIn,
  onCheckInVehicle,
  onUpdateVehicle,
}: VehiclesSummaryProps) {
  const [vehicleModalOpen, setVehicleModalOpen] = useState<boolean>(false);
  const [selectedTripVehicle, setSelectedTripVehicle] = useState<
    IBookingTripVehicle | undefined
  >();
  const [vehicleColumns, setVehicleColumns] = useState<
    ColumnsType<IBookingTripVehicle>
  >(vehicleColumnsWithoutActions);

  const initializeData = () => {
    if (vehicles === undefined) {
      return;
    }

    if (onCheckInVehicle === undefined || !canCheckIn) {
      return;
    }

    setVehicleColumns([
      ...vehicleColumnsWithoutActions,
      {
        title: 'Check-In Status',
        render: (_, vehicle) => {
          if (vehicle.checkInDate === undefined) {
            return (
              <Button
                type='primary'
                onClick={() =>
                  onCheckInVehicle(vehicle.tripId, vehicle.vehicleId)
                }
              >
                Check In
              </Button>
            );
          }

          const checkInDateFromNow = dayjs(vehicle.checkInDate).fromNow();
          return (
            <Badge status='success' text={`Checked in ${checkInDateFromNow}`} />
          );
        },
      },
      {
        title: 'Actions',
        render: (_, vehicle) => (
          <Flex gap={8}>
            {onUpdateVehicle && (
              <Button
                type='primary'
                onClick={() => {
                  setSelectedTripVehicle(vehicle);
                  setVehicleModalOpen(true);
                }}
                icon={<EditOutlined />}
              />
            )}
            <Button
              type='default'
              href={`/bookings/${vehicle.bookingId}/trips/${vehicle.tripId}/vehicles/${vehicle.vehicleId}`}
              target='_blank'
              icon={<ExportOutlined />}
            />
          </Flex>
        ),
      },
    ]);
  };

  useEffect(() => {
    initializeData();
  }, [vehicles]);

  const updateTripVehicle = async (vehicle: IVehicle): Promise<void> => {
    if (!selectedTripVehicle || !onUpdateVehicle) {
      return;
    }
    await onUpdateVehicle(
      selectedTripVehicle.tripId,
      selectedTripVehicle.vehicleId,
      vehicle
    );
    setVehicleModalOpen(false);
  };

  return (
    <>
      <Table
        columns={vehicleColumns}
        dataSource={vehicles}
        pagination={false}
        loading={vehicles === undefined}
        tableLayout='fixed'
      ></Table>
      {onUpdateVehicle && (
        <UpdateTripVehicleModal
          open={vehicleModalOpen}
          originalTripVehicle={selectedTripVehicle}
          onUpdateVehicle={(vehicle) => updateTripVehicle(vehicle)}
          onCancel={() => setVehicleModalOpen(false)}
          width={300}
        />
      )}
    </>
  );
}
