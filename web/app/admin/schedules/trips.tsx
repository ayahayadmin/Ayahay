import React, { useEffect, useState } from 'react';
import { ITrip, mockTrips } from '@ayahay/models/trip.model';
import { filter, split } from 'lodash';
import { getTime } from '@/services/search.service';
import { Button, Space, Table } from 'antd';
import { useRouter } from 'next/navigation';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import { IPort } from '@ayahay/models/port.model';
import Seats from '../details/seats';

const PAGE_SIZE = 10;
const rowDataInitial = {
  shipId: -1,
  cabinType: '',
  floor: '',
};

export default function Trips() {
  //props: ShipId
  const shipId = 1;

  const router = useRouter();
  const [trips, setTrips] = useState([] as ITrip[]);
  // const [buttonClicked, setButtonClicked] = useState(false);
  const [rowData, setRowData] = useState({ ...rowDataInitial });

  const onDetailsClick = (data: any) => {
    // setButtonClicked(true);
    // setRowData({
    //   shipId: data.ship.id,
    //   cabinType: data.ship.cabins[0].type,
    //   floor: data.ship.cabins[0].name,
    // });
    // const rowData = {
    //   shipId: data.ship.id,
    //   cabinType: data.ship.cabins[0].type,
    //   floor: data.ship.cabins[0].name,
    // };
    return (
      <div>
        <Seats rowData={rowData} />
      </div>
    );
  };
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
    // {
    //   key: 'slots',
    //   dataIndex: 'slots',
    //   render: (text: string) => <span>{`${text} slot/s`}</span>,
    // },
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
            // onClick={() => onDetailsClick(record)}
            onClick={() => router.push(`/admin/details?tripId=${record.id}`)}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  // {/* shipId=${record.ship.id}&cabinType=${record.ship.cabins[0].type}&floor=${record.ship.cabins[0].name} */}
  //           {/* router.push(
  //               `/admin/details?shipId=${record.ship.id}&cabinType=${record.ship.cabins[0].type}`
  //             ) */}
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
      {/* {buttonClicked && <Seats rowData={rowData} />} */}
    </div>
  );
}
