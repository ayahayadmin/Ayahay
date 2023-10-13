import styles from './searchResults.module.scss';
import React, { useEffect, useState } from 'react';
import { Button, Pagination, Skeleton, Space, Table, Tooltip } from 'antd';
import { ITrip, IShippingLine } from '@ayahay/models';
import { TripsSearchQuery } from '@ayahay/http';
import { find, forEach, split, sumBy } from 'lodash';
import {
  getAvailableTrips,
  getCabinCapacities,
  getCabinFares,
  getMaximumFare,
} from '@/services/trip.service';
import { getTime } from '@/services/search.service';
import { ArrowRightOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const columns: ColumnsType<ITrip> = [
  {
    key: 'logo',
    dataIndex: 'shippingLine',
    render: (text: IShippingLine) => (
      <img
        src='/assets/aznar-logo.png'
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
        {record.srcPort!.name} <ArrowRightOutlined rev={undefined} />
        &nbsp;
        {record.destPort!.name}
      </span>
    ),
    responsive: ['md'],
  },
  {
    key: 'departureDateTime',
    dataIndex: 'departureDateIso',
    render: (text: string) => (
      <div>
        <span className={styles['departureDateTime']}>
          {dayjs(text).format('MMMM D, YYYY')}
        </span>
        <br></br>
        <span>{getTime(text)}</span>
      </div>
    ),
    responsive: ['md'],
  },
  {
    key: 'srcDestPortAndDepartureDateTime',
    render: (text: string, record: ITrip) => (
      <span className={styles['port-date']}>
        <div>
          {record.srcPort!.name} <ArrowRightOutlined rev={undefined} />
          &nbsp;
          {record.destPort!.name}
        </div>
        <div>
          {dayjs(record.departureDateIso).format('MMMM D, YYYY')} at&nbsp;
          {getTime(record.departureDateIso)}
        </div>
      </span>
    ),
    align: 'center',
  },
  {
    key: 'passengerSlots',
    render: (text: string, record: ITrip) => {
      const cabinCapacities: any[] = getCabinCapacities(record.availableCabins);
      let tooltipTitle = '';
      forEach(cabinCapacities, (cabin, idx) => {
        if (idx === cabinCapacities.length - 1) {
          tooltipTitle += `${cabin.name}: ${cabin.available}/${cabin.total}`;
        } else {
          tooltipTitle += `${cabin.name}: ${cabin.available}/${cabin.total}; `;
        }
      });

      const totalAvailable = sumBy(cabinCapacities, 'available');
      const totalCapacity = sumBy(cabinCapacities, 'total');

      return (
        <div>
          <span
            className={styles['slots']}
          >{`${totalAvailable} slot/s left`}</span>
          &nbsp;
          <Tooltip title={tooltipTitle}>
            <InfoCircleOutlined rev={undefined} />
          </Tooltip>
        </div>
      );
    },
    responsive: ['md'],
  },
  {
    key: 'vehicleSlots',
    dataIndex: 'availableVehicleCapacity',
    render: (text: string, record: ITrip) => (
      <span>{`${text} vehicle slot/s left`}</span>
    ),
  },
  {
    key: 'adultFare',
    render: (text: string, record: ITrip) => {
      const adultFares: any[] = getCabinFares(record.availableCabins);
      let tooltipTitle = '';
      forEach(adultFares, (fare, idx) => {
        if (idx === adultFares.length - 1) {
          tooltipTitle += `${fare.name}: ${fare.fare}`;
        } else {
          tooltipTitle += `${fare.name}: ${fare.fare}; `;
        }
      });

      const minFare = getMaximumFare(adultFares);

      return (
        <div>
          <span className={styles['price']}>{`PHP ${minFare}`}</span>&nbsp;
          <Tooltip title={`${tooltipTitle}`}>
            <InfoCircleOutlined rev={undefined} />
          </Tooltip>
        </div>
      );
    },
    responsive: ['md'],
  },
  {
    key: 'action',
    dataIndex: 'id',
    render: (text: string) => (
      <Space size='middle'>
        <Button
          type='primary'
          size='large'
          href={`${process.env.NEXT_PUBLIC_WEB_URL}/bookings/create?tripId=${text}`}
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
        <div className={styles['price']}>{`PHP ${'1000'}`}</div>
        {/* record.availableCabins[0].adultFare */}
        <div>{`${text} slot/s`}</div>
        <Space size='middle'>
          <Button
            type='primary'
            size='large'
            href={`${process.env.NEXT_PUBLIC_WEB_URL}/bookings/create?tripId=${text}`}
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
          {record.srcPort!.name} <ArrowRightOutlined rev={undefined} />
          &nbsp;
          {record.destPort!.name}
        </div>
        <div>
          {split(record.departureDateIso, 'T')[0]} at&nbsp;
          {getTime(record.departureDateIso)}
        </div>
        <div className={styles['price']}>{`PHP ${'1000'}`}</div>&nbsp;
        {/* record.availableCabins[0].adultFare */}
        <div>{`${text} slot/s`}</div>
        <Space size='middle'>
          <Button
            type='primary'
            size='large'
            href={`${process.env.NEXT_PUBLIC_WEB_URL}/bookings/create?tripId=${text}`}
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

  useEffect(() => {
    setPage(1);
    fetchTrips(page);
  }, [searchQuery]);

  useEffect(() => {
    fetchTrips(page);
  }, [page]);

  const fetchTrips = async (page: number) => {
    setLoading(true);
    const trips = await getAvailableTrips(searchQuery);
    const tripData = find(trips?.data, { page });

    setTripData(tripData?.availableTrips || []);
    setTotalPages(totalPages);
    setTotalItems(totalItems);
    setLoading(false);
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
