import React, { useEffect, useState } from 'react';
import { Skeleton, Button, notification, Badge } from 'antd';
import { IBookingVehicle } from '@ayahay/models';
import Table, { ColumnsType } from 'antd/es/table';
import { useLoggedInAccount } from '@ayahay/hooks/auth';
import { checkInVehicle } from '@ayahay/services/booking.service';
import dayjs from 'dayjs';

interface VehiclesSummaryProps {
  vehicles?: IBookingVehicle[];
  allowCheckIn: boolean;
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
  allowCheckIn,
}: VehiclesSummaryProps) {
  const [api, contextHolder] = notification.useNotification();
  const { loggedInAccount } = useLoggedInAccount();
  const [vehicleColumns, setVehicleColumns] = useState<
    ColumnsType<VehicleInformation>
  >(vehicleColumnsWithoutActions);
  const [vehicleRows, setVehicleRows] = useState<VehicleInformation[]>([]);

  const onCheckIn = async (vehicle: VehicleInformation) => {
    try {
      await checkInVehicle(vehicle.bookingId, vehicle.key);
      const updatedVehicleRows = vehicleRows.map((oldVehicle) => {
        if (oldVehicle.key === vehicle.key) {
          oldVehicle.checkInDate = new Date().toISOString();
          return oldVehicle;
        }
        return oldVehicle;
      });
      setVehicleRows(updatedVehicleRows);

      api.success({
        message: 'Check In Success',
        description: 'The selected vehicle has checked in successfully.',
      });
    } catch (e) {
      api.error({
        message: 'Check In Failed',
        description: 'The selected vehicle has already checked in.',
      });
    }
  };

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

    if (
      !allowCheckIn ||
      loggedInAccount === undefined ||
      loggedInAccount.role === 'Passenger'
    ) {
      return;
    }

    setVehicleColumns([
      ...vehicleColumnsWithoutActions,
      {
        title: 'Check-In Status',
        render: (_, vehicle) => {
          if (vehicle.checkInDate === undefined) {
            return (
              <Button type='primary' onClick={() => onCheckIn(vehicle)}>
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
  }, [loggedInAccount, vehicles]);

  return (
    <Skeleton loading={vehicles === undefined} active>
      {vehicles && vehicles.length > 0 && (
        <Table
          columns={vehicleColumns}
          dataSource={vehicleRows}
          pagination={false}
          tableLayout='fixed'
        ></Table>
      )}
      {contextHolder}
    </Skeleton>
  );
}

interface VehicleInformation {
  key: number;
  bookingId: number;
  plateNo: string;
  model: string;
  vehicleTypeName: string;
  checkInDate?: string;
}
