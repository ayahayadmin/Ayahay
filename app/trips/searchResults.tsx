import React, { useEffect, useState } from 'react';
import { Button, Pagination, Space, Table } from 'antd';
import styles from './trips.module.scss';
import { trips } from './mockData';
import { AvailableTrips, Trip } from '@/common/models/trip';
import { find } from 'lodash';

const columns = [
  {
    key: 'shippingLine',
    dataIndex: 'shippingLine',
  },
  {
    key: 'sourceLoc',
    dataIndex: 'sourceLoc',
  },
  {
    key: 'destinationLoc',
    dataIndex: 'destinationLoc',
  },
  {
    key: 'departureDate',
    dataIndex: 'departureDate',
  },
  {
    key: 'action',
    render: () => (
      <Space size='middle'>
        <Button type='primary' size='large'>
          Book Now!
        </Button>
      </Space>
    ),
  },
];
const PAGE_SIZE = 10;

export default function SearchResult() {
  const [tripData, setTripData] = useState([] as AvailableTrips[]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    getTrips(page);
  }, [page]);

  const getTrips = (page: number) => {
    const fetch = trips;
    const { data, totalPages, totalItems } = fetch;
    const tripData = find(data, { page });
    setTripData(tripData!.availableTrips);
    setTotalPages(totalPages);
    setTotalItems(totalItems);
  };

  return (
    <div>
      <Table
        columns={columns}
        dataSource={tripData}
        className={styles.searchResult}
        pagination={false}
      ></Table>
      {totalItems / PAGE_SIZE > 1 && (
        <Pagination
          total={totalItems}
          current={page}
          pageSize={PAGE_SIZE}
          onChange={(page) => setPage(page)}
        ></Pagination>
      )}
    </div>
  );
}
