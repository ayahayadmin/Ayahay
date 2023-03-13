import React, { useEffect, useState } from 'react';
import { Button, Pagination, Skeleton, Space, Table } from 'antd';
import styles from './trips.module.scss';
import Trip from '@/common/models/trip.model';
import { find, get, toNumber } from 'lodash';
import { getPorts } from '@/common/services/port.service';
import { getTrips } from '@/common/services/trip.service';
import SearchQuery from '@/common/models/search-query.model';
import Port from '@/common/models/port.model';
import ShippingLine from '@/common/models/shipping-line.model';

const columns = [
  {
    key: 'shippingLine',
    dataIndex: 'shippingLine',
    render: (text: ShippingLine) => <span>{text.name}</span>,
  },
  {
    key: 'srcPort',
    dataIndex: 'srcPort',
    render: (text: Port) => <span>{text.name}</span>,
  },
  {
    key: 'destPort',
    dataIndex: 'destPort',
    render: (text: Port) => <span>{text.name}</span>,
  },
  {
    key: 'departureDateIso',
    dataIndex: 'departureDateIso',
  },
  {
    key: 'baseFare',
    dataIndex: 'baseFare',
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
  const [tripData, setTripData] = useState([] as Trip[]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const ports = getPorts();

  useEffect(() => {
    fetchTrips(page);
  }, [searchQuery, page]);

  const fetchTrips = (page: number) => {
    setLoading(true);
    setTimeout(() => {
      const srcPort = get(
        find(ports, { id: toNumber(searchQuery.srcPortId) }),
        'name'
      );
      const destPort = get(
        find(ports, { id: toNumber(searchQuery.destPortId) }),
        'name'
      );

      const trips = getTrips(srcPort!, destPort!);
      const { data, totalPages, totalItems } = trips;
      const tripData = find(data, { page });
      setTripData(tripData?.availableTrips || []);
      setTotalPages(totalPages);
      setTotalItems(totalItems);
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <strong>{totalItems} result(s)</strong> based on the search
      <Skeleton
        loading={loading}
        active
        title={false}
        paragraph={{ rows: 5, width: [1300, 1300, 1300, 1300, 1300] }}
      >
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
      </Skeleton>
    </div>
  );
}
