'use client';
import { Button, Table, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { ColumnsType } from 'antd/es/table';
import { IShip } from '@ayahay/models';
import { getShipsOfMyShippingLine } from '@/services/ship.service';
import { useAuthGuard } from '@/hooks/auth';

const { Title } = Typography;

const columns: ColumnsType<IShip> = [
  {
    title: 'Vessel Name',
    key: 'name',
    dataIndex: 'name',
  },
  {
    title: 'Recommended Vehicle Capacity',
    key: 'recommendedVehicleCapacity',
    dataIndex: 'recommendedVehicleCapacity',
  },
  {
    title: 'Actions',
    render: (_, ship: IShip) => (
      <div>
        <Button type='primary' href={`/ships/${ship.id}`} target='_blank'>
          View
        </Button>
      </div>
    ),
  },
];

export default function ShipsPage() {
  useAuthGuard(['Staff', 'Admin', 'SuperAdmin']);
  const [ships, setShips] = useState<IShip[]>([]);

  const fetchShips = async () => {
    setShips(await getShipsOfMyShippingLine());
  };

  useEffect(() => {
    fetchShips();
  }, []);

  return (
    <div style={{ margin: '32px' }}>
      <Title level={1}>Vessels</Title>
      <Table columns={columns} dataSource={ships} tableLayout='fixed' />
    </div>
  );
}
