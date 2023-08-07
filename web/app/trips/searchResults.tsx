import styles from './searchResults.module.scss';
import React, { useEffect, useState } from 'react';
import { Button, Pagination, Skeleton, Space, Table } from 'antd';
import { ITrip, IShippingLine } from '@ayahay/models';
import { TripsSearchQuery } from '@ayahay/http';
import { find, get, split, toNumber } from 'lodash';
import { getPorts } from '@/services/port.service';
import { getTrips } from '@/services/trip.service';
import { getTime } from '@/services/search.service';
import { ArrowRightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const columns: ColumnsType<ITrip> = [
  {
    key: 'logo',
    dataIndex: 'shippingLine',
    render: (text: IShippingLine) => (
      <img
        src='/assets/logo-placeholder.png'
        alt={`${text.name} Logo`}
        height={80}
        className={styles['logo']}
      />
    ),
    align: 'left',
  },
  {
    key: 'srcDestPort',
    render: (text: string, record: ITrip) => (
      <span className={styles['port']}>
        {record.srcPort!.name} <ArrowRightOutlined /> {record.destPort!.name}
      </span>
    ),
    responsive: ['md'],
  },
  {
    key: 'departureDateTime',
    dataIndex: 'departureDateIso',
    render: (text: string) => (
      <span className={styles['departureDateTime']}>
        {split(text, 'T')[0]} at {getTime(text)}
      </span>
    ),
    responsive: ['md'],
  },
  {
    key: 'srcDestPortAndDepartureDateTime',
    render: (text: string, record: ITrip) => (
      <span className={styles['port-date']}>
        <div>
          {record.srcPort!.name} <ArrowRightOutlined /> {record.destPort!.name}
        </div>
        <div>
          {split(record.departureDateIso, 'T')[0]} at{' '}
          {getTime(record.departureDateIso)}
        </div>
      </span>
    ),
    align: 'center',
  },
  {
    key: 'slots',
    dataIndex: 'slots',
    render: (text: string) => (
      <span className={styles['slots']}>{`${text} slot/s`}</span>
    ),
    responsive: ['md'],
  },
  {
    key: 'baseFare',
    dataIndex: 'baseFare',
    render: (text: string) => (
      <span className={styles['price']}>{`PHP ${text}`}</span>
    ),
    responsive: ['md'],
  },
  {
    key: 'action',
    render: () => (
      <Space size='middle'>
        <Button
          type='primary'
          size='large'
          href='https://ayahay-booking-platform-web.vercel.app/bookings/create?tripId=1'
          target='_blank'
          className={styles['book-button']}
        >
          Book Now!
        </Button>
      </Space>
    ),
    responsive: ['md'],
    align: 'right',
  },
  {
    key: 'slotsAndPriceAndAction',
    dataIndex: 'slots',
    render: (text: string, record: ITrip) => (
      <span className={styles['slot-price-action']}>
        <div className={styles['price']}>{`PHP ${record.baseFare}`}</div>
        <div>{`${text} slot/s`}</div>
        <Space size='middle'>
          <Button
            type='primary'
            size='large'
            href='https://ayahay-booking-platform-web.vercel.app/bookings/create?tripId=1'
            target='_blank'
            className={styles['book-button']}
          >
            Book Now!
          </Button>
        </Space>
      </span>
    ),
    align: 'right',
  },
  {
    key: 'allColumns',
    dataIndex: 'slots',
    render: (text: string, record: ITrip) => (
      <span className={styles['all-columns']}>
        <div>
          {record.srcPort!.name} <ArrowRightOutlined /> {record.destPort!.name}
        </div>
        <div>
          {split(record.departureDateIso, 'T')[0]} at{' '}
          {getTime(record.departureDateIso)}
        </div>
        <div className={styles['price']}>{`PHP ${record.baseFare}`}</div>
        <div>{`${text} slot/s`}</div>
        <Space size='middle'>
          <Button
            type='primary'
            size='large'
            href='https://ayahay-booking-platform-web.vercel.app/bookings/create?tripId=1'
            target='_blank'
            className={styles['book-button']}
          >
            Book Now!
          </Button>
        </Space>
      </span>
    ),
    align: 'right',
  },
];
const PAGE_SIZE = 10;

interface SearchResultsProps {
  searchQuery: TripsSearchQuery;
}

export default function SearchResult({ searchQuery }: SearchResultsProps) {
  const [tripData, setTripData] = useState([] as ITrip[]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const ports = getPorts();

  useEffect(() => {
    setPage(1);
    fetchTrips(page);
  }, [searchQuery]);

  useEffect(() => {
    fetchTrips(page);
  }, [page]);

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
      <div className={styles['results-container']}>
        <strong>{totalItems} result(s)</strong> based on the search
      </div>
      <Skeleton
        loading={loading}
        active
        title={false}
        paragraph={{ rows: 5, width: ['100%', '100%', '100%', '100%', '100%'] }}
      >
        <Table
          columns={columns}
          dataSource={tripData}
          className={styles['search-result']}
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
