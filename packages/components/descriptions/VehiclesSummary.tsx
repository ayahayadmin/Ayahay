import React, { useEffect, useState } from 'react';
import { Button, Badge } from 'antd';
import { IBookingVehicle } from '@ayahay/models';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface VehiclesSummaryProps {
  vehicles?: IBookingVehicle[];
  hasPrivilegedAccess?: boolean;
  onCheckInVehicle?: (bookingVehicleId: number) => Promise<void>;
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
  hasPrivilegedAccess,
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
      vehicles.map(({ vehicle, ...bookingVehicle }) => ({
        key: bookingVehicle.id,
        bookingId: bookingVehicle.bookingId,
        plateNo: vehicle.plateNo,
        model: vehicle.modelName,
        vehicleTypeName: vehicle.vehicleType?.name ?? '',
        checkInDate: bookingVehicle.checkInDate,
      }))
    );

    if (onCheckInVehicle === undefined || !hasPrivilegedAccess) {
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
                onClick={() => onCheckInVehicle(vehicle.key)}
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
  plateNo: string;
  model: string;
  vehicleTypeName: string;
  checkInDate?: string;
}
