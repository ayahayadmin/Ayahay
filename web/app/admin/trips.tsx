import { ITrip, mockTrips } from '@ayahay/models/trip.model';
import { filter, find, split } from 'lodash';
import React, { useEffect, useState } from 'react';
import { getTime } from '@/services/search.service';
import { Button, Space, Table } from 'antd';
import { useRouter } from 'next/navigation';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import { IPort } from '@ayahay/models/port.model';

const PAGE_SIZE = 10;

export default function Trips() {
  //props: ShipId
  const shipId = 1;

  const router = useRouter();
  const [trips, setTrips] = useState([] as ITrip[]);
  //   const [buttonClicked, setButtonClicked] = useState(false);

  //   useEffect(() => {
  //     console.log('pasok');

  //     router.push(`/admin/details`);
  //   }, [buttonClicked]);

  const columns = [
    {
      key: 'logo',
      dataIndex: 'shippingLine',
    },
    {
      key: 'shippingLine',
      dataIndex: 'shippingLine',
      render: (text: IShippingLine) => <span>{text.name}</span>,
    },
    {
      key: 'srcPort',
      dataIndex: 'srcPort',
      render: (text: IPort) => <span>{text.name}</span>,
    },
    {
      key: 'departureDate',
      dataIndex: 'departureDateIso',
      render: (text: string) => <span>{split(text, 'T')[0]}</span>,
    },
    {
      key: 'destPort',
      dataIndex: 'destPort',
      render: (text: IPort) => <span>{text.name}</span>,
    },
    {
      key: 'departureTime',
      dataIndex: 'departureDateIso',
      render: (text: string) => <span>{getTime(text)}</span>,
    },
    {
      key: 'slots',
      dataIndex: 'slots',
      render: (text: string) => <span>{`${text} slot/s`}</span>,
    },
    {
      key: 'baseFare',
      dataIndex: 'baseFare',
      render: (text: string) => <span>{`PHP ${text}`}</span>,
    },
    {
      key: 'action',
      render: (text: any, record: any) => (
        <Space size='middle'>
          <Button
            type='primary'
            size='large'
            onClick={() =>
              router.push(`/admin/details?shipId=${record.ship.id}`)
            }
          >
            Details
            {/* &cabinType=${record.ship.cabins[0].type}&floor=${record.ship.cabins[0].name} */}
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const fetchTrips = filter(mockTrips, { shippingLine: { id: shipId } });
    setTrips(fetchTrips);
  }, []);

  return (
    <div>
      <Table
        columns={columns}
        dataSource={trips}
        // className={styles.searchResult}
        pagination={false}
      ></Table>
    </div>
  );
}
