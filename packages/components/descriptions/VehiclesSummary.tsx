import React, { useEffect, useState } from 'react';
import { Button, Badge } from 'antd';
import { IBookingTripVehicle } from '@ayahay/models';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { ExportOutlined } from '@ant-design/icons';

interface VehiclesSummaryProps {
  vehicles?: IBookingTripVehicle[];
  canCheckIn?: boolean;
  onCheckInVehicle?: (tripId: number, vehicleId: number) => Promise<void>;
}

const vehicleColumnsWithoutActions: ColumnsType<VehicleInformation> = [
  {
    title: 'Name',
    render: (_, vehicle) => {
      return (
        <div>
          <strong>{vehicle.plateNo}</strong>
          <p>{vehicle.model}</p>
        </div>
      );
    },
  },
  {
    title: 'Type',
    dataIndex: 'vehicleTypeName',
    key: 'vehicleTypeName',
  },
];

export default function VehiclesSummary({
  vehicles,
  canCheckIn,
  onCheckInVehicle,
}: VehiclesSummaryProps) {
  const [vehicleColumns, setVehicleColumns] = useState<
    ColumnsType<VehicleInformation>
  >(vehicleColumnsWithoutActions);
  const [vehicleRows, setVehicleRows] = useState<VehicleInformation[]>([]);

  const initializeData = () => {
    if (vehicles === undefined) {
      setVehicleRows([]);
      return;
    }

    setVehicleRows(
      vehicles.map(({ vehicle, ...bookingVehicle }, index) => ({
        key: index,
        bookingId: bookingVehicle.bookingId,
        tripId: bookingVehicle.tripId,
        vehicleId: bookingVehicle.vehicleId,
        plateNo: vehicle?.plateNo ?? '',
        model: vehicle?.modelName ?? '',
        vehicleTypeName: vehicle?.vehicleType?.name ?? '',
        checkInDate: bookingVehicle.checkInDate,
      }))
    );

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
          <Button
            type='default'
            href={`/bookings/${vehicle.bookingId}/trips/${vehicle.tripId}/vehicles/${vehicle.vehicleId}`}
            target='_blank'
            icon={<ExportOutlined />}
          />
        ),
      },
    ]);
  };

  useEffect(() => {
    initializeData();
  }, [vehicles]);

  return (
    <Table
      columns={vehicleColumns}
      dataSource={vehicleRows}
      pagination={false}
      loading={vehicles === undefined}
      tableLayout='fixed'
    ></Table>
  );
}

interface VehicleInformation {
  key: number;
  bookingId: string;
  tripId: number;
  vehicleId: number;
  plateNo: string;
  model: string;
  vehicleTypeName: string;
  checkInDate?: string;
}
