import React, { useEffect, useState } from 'react';
import { Button, Pagination, Skeleton, Space, Table } from 'antd';
import styles from './trips.module.scss';
import Trip from '@/common/models/trip.model';
import { find, get, split, toNumber } from 'lodash';
import { getPorts } from '@/common/services/port.service';
import { getTrips } from '@/common/services/trip.service';
import SearchQuery from '@/common/models/search-query.model';
import Port from '@/common/models/port.model';
import ShippingLine from '@/common/models/shipping-line.model';
import { getTime } from '@/common/services/search.service';

const columns = [
  {
    key: 'logo',
    dataIndex: 'shippingLine',
    render: (text: ShippingLine) => (
      <img
        src='/assets/logo-placeholder.png'
        alt={`${text.name} Logo`}
        height={80}
      />
    ),
  },
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
    key: 'departureDate',
    dataIndex: 'departureDateIso',
    render: (text: string) => <span>{split(text, 'T')[0]}</span>,
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
    const {
      departureDateIso,
      destPortId,
      numAdults,
      numChildren,
      numInfants,
      shippingLineIds,
      sort,
      srcPortId,
    } = searchQuery;
    setTimeout(() => {
      const srcPort = get(find(ports, { id: toNumber(srcPortId) }), 'name');
      const destPort = get(find(ports, { id: toNumber(destPortId) }), 'name');
      const paxes = {
        numAdults,
        numChildren,
        numInfants,
      };
      const trips = getTrips(
        srcPort!,
        destPort!,
        departureDateIso,
        paxes,
        sort,
        shippingLineIds
      );
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
