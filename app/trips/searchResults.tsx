import React, { useEffect, useState } from 'react';
import { Button, Pagination, Skeleton, Space, Table } from 'antd';
import styles from './trips.module.scss';
import { AvailableTrips } from '@/common/models/trip.model';
import { find, get, toNumber } from 'lodash';
import { getPorts } from '@/common/services/port.service';
import { getTrips } from '@/common/services/trip.service';
import SearchQuery from '@/common/models/search-query.model';

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

interface SearchResultsProps {
  searchQuery: SearchQuery;
}

export default function SearchResult({ searchQuery }: SearchResultsProps) {
  const [tripData, setTripData] = useState([] as AvailableTrips[]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const ports = getPorts();

  useEffect(() => {
    console.log(searchQuery);

    fetchTrips(page);
  }, [searchQuery, page]);

  const fetchTrips = (page: number) => {
    setLoading(true);

    const sourceLoc = get(
      find(ports, { id: toNumber(searchQuery.srcPortId) }),
      'name'
    );
    const destinationLoc = get(
      find(ports, { id: toNumber(searchQuery.destPortId) }),
      'name'
    );

    const trips = getTrips(sourceLoc!, destinationLoc!);
    const { data, totalPages, totalItems } = trips;
    const tripData = find(data, { page });
    setTripData(tripData?.availableTrips || []);
    setTotalPages(totalPages);
    setTotalItems(totalItems);
    setLoading(false);
  };

  return (
    <div>
      <strong>{totalItems} result(s)</strong> based on the search
      {/* <Skeleton loading={loading} active paragraph>
        Data
      </Skeleton> */}
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
