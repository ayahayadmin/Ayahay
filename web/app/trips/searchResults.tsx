import styles from './searchResults.module.scss';
import React, { useEffect, useState } from 'react';
import { Button, Pagination, Popover, Skeleton, Table } from 'antd';
import { ITrip, IShippingLine, ITripCabin, IAccount } from '@ayahay/models';
import { TripsSearchQuery } from '@ayahay/http';
import { find, sumBy } from 'lodash';
import {
  getAvailableTrips,
  getCabinCapacities,
  getCabinFares,
  getMaximumFare,
} from '@/services/trip.service';
import {
  getTime,
  getCabinPopoverContent,
  getFarePopoverContent,
} from '@/services/search.service';
import { ArrowRightOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const PAGE_SIZE = 10;

interface TripSearchResultsProps {
  searchQuery: TripsSearchQuery;
  selectedTrip?: ITrip;
  loggedInAccount: IAccount | null | undefined;
  onSelectTrip?: (trip: ITrip) => void;
}

export default function TripSearchResult({
  searchQuery,
  selectedTrip,
  loggedInAccount,
  onSelectTrip,
}: TripSearchResultsProps) {
  const [tripData, setTripData] = useState([] as ITrip[]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const TripActionButton = ({ trip }: { trip: ITrip }) => (
    <Button
      type='primary'
      size='large'
      disabled={trip.id === selectedTrip?.id}
      onClick={() => onSelectTrip && onSelectTrip(trip)}
      className={styles['book-button']}
    >
      Book Now!
    </Button>
  );

  const columns: ColumnsType<ITrip> = [
    {
      key: 'logo',
      dataIndex: 'shippingLine',
      render: (shippingLine: IShippingLine) => (
        <img
          src={`/assets/shipping-line-logos/${shippingLine.name}.png`}
          alt={`${shippingLine.name} Logo`}
          height={80}
          className={styles['logo']}
        />
      ),
      align: 'left',
    },
    {
      key: 'srcDestPort',
      render: (_, record: ITrip) => (
        <span className={styles['port']}>
          {record.srcPort!.name} <ArrowRightOutlined />
          &nbsp;
          {record.destPort!.name}
        </span>
      ),
      responsive: ['lg'],
    },
    {
      key: 'departureDateTime',
      dataIndex: 'departureDateIso',
      render: (text: string) => (
        <div className={styles['departureDateTime']}>
          <span>{dayjs(text).format('MMMM D, YYYY')}</span>
          <br></br>
          <span>{getTime(text)}</span>
        </div>
      ),
      responsive: ['lg'],
    },
    {
      key: 'srcDestPortAndDepartureDateTime',
      render: (_, record: ITrip) => (
        <span className={styles['port-date']}>
          <div>
            {record.srcPort!.name} <ArrowRightOutlined />
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
      responsive: ['sm'],
    },
    {
      key: 'passengerSlots',
      render: (_, record: ITrip) => {
        const cabinCapacities: any[] = getCabinCapacities(
          record.availableCabins
        );
        const popoverContent = getCabinPopoverContent(cabinCapacities);
        const totalAvailable = sumBy(cabinCapacities, 'available');
        const totalCapacity = sumBy(cabinCapacities, 'total');

        return (
          <div>
            {`${totalAvailable} slot/s left`}
            &nbsp;
            <Popover title={'Available Slots'} content={popoverContent}>
              <InfoCircleOutlined />
            </Popover>
          </div>
        );
      },
      responsive: ['lg'],
    },
    {
      key: 'vehicleSlots',
      dataIndex: 'availableVehicleCapacity',
      render: (text: string) => <span>{`${text} vehicle slot/s left`}</span>,
      responsive: ['lg'],
    },
    {
      key: 'passengerAndVehicleSlots',
      render: (_, record: ITrip) => {
        const cabinCapacities: any[] = getCabinCapacities(
          record.availableCabins
        );
        const popoverContent = getCabinPopoverContent(cabinCapacities);
        const totalAvailable = sumBy(cabinCapacities, 'available');
        const totalCapacity = sumBy(cabinCapacities, 'total');

        return (
          <div className={styles['passenger-vehicle-slots']}>
            {`${totalAvailable} slot/s left`}
            &nbsp;
            <Popover title={'Available Slots'} content={popoverContent}>
              <InfoCircleOutlined />
            </Popover>
            <div>{`${record.availableVehicleCapacity} vehicle slot/s left`}</div>
          </div>
        );
      },
      align: 'center',
      responsive: ['md'],
    },
    {
      key: 'adultFare',
      dataIndex: 'availableCabins',
      render: (availableCabins: ITripCabin[]) => {
        const adultFares: any[] = getCabinFares(availableCabins);
        const popoverContent = getFarePopoverContent(adultFares);
        const minFare = getMaximumFare(adultFares);

        return (
          <div>
            <span className={styles['price']}>{`PHP ${minFare}`}</span>&nbsp;
            <Popover title={'Cabin Fares'} content={popoverContent}>
              <InfoCircleOutlined />
            </Popover>
          </div>
        );
      },
      responsive: ['lg'],
    },
    {
      key: 'action',
      dataIndex: 'id',
      render: (text: string, trip: ITrip) => <TripActionButton trip={trip} />,
      align: 'right',
      responsive: ['lg'],
    },
    {
      key: 'priceAndAction',
      dataIndex: 'id',
      render: (text: string, record: ITrip) => {
        const adultFares: any[] = getCabinFares(record.availableCabins);
        const popoverContent = getFarePopoverContent(adultFares);
        const minFare = getMaximumFare(adultFares);

        return (
          <div className={styles['price-action']}>
            <div className={styles['price']}>
              {`PHP ${minFare}`}&nbsp;
              <Popover title={'Cabin Fares'} content={popoverContent}>
                <InfoCircleOutlined />
              </Popover>
            </div>
            <div>
              <TripActionButton trip={record} />
            </div>
          </div>
        );
      },
      align: 'right',
      responsive: ['md'],
    },
    {
      key: 'allColumnsExceptPortsAndDateTime',
      dataIndex: 'id',
      render: (text: string, record: ITrip) => {
        const cabinCapacities: any[] = getCabinCapacities(
          record.availableCabins
        );
        const slotsPopoverContent = getCabinPopoverContent(cabinCapacities);
        const totalAvailable = sumBy(cabinCapacities, 'available');
        const totalCapacity = sumBy(cabinCapacities, 'total');
        const adultFares: any[] = getCabinFares(record.availableCabins);
        const farePopoverContent = getFarePopoverContent(adultFares);
        const minFare = getMaximumFare(adultFares);

        return (
          <span className={styles['all-columns-except-port-date']}>
            {`${totalAvailable} slot/s left`}
            &nbsp;
            <Popover title={'Available Slots'} content={slotsPopoverContent}>
              <InfoCircleOutlined />
            </Popover>
            <div>{`${record.availableVehicleCapacity} vehicle slot/s left`}</div>
            <div className={styles['price']} style={{ marginTop: 10 }}>
              {`PHP ${minFare}`}&nbsp;
              <Popover title={'Cabin Fares'} content={farePopoverContent}>
                <InfoCircleOutlined />
              </Popover>
            </div>
            <div>
              <TripActionButton trip={record} />,
            </div>
          </span>
        );
      },
      align: 'right',
      responsive: ['sm'],
    },
    {
      key: 'allColumns',
      dataIndex: 'id',
      render: (text: string, record: ITrip) => {
        const cabinCapacities: any[] = getCabinCapacities(
          record.availableCabins
        );
        const slotsPopoverContent = getCabinPopoverContent(cabinCapacities);
        const totalAvailable = sumBy(cabinCapacities, 'available');
        const totalCapacity = sumBy(cabinCapacities, 'total');
        const adultFares: any[] = getCabinFares(record.availableCabins);
        const farePopoverContent = getFarePopoverContent(adultFares);
        const minFare = getMaximumFare(adultFares);

        return (
          <span className={styles['all-columns']}>
            <div>
              {record.srcPort!.name} <ArrowRightOutlined />
              &nbsp;
              {record.destPort!.name}
            </div>
            <div>
              {dayjs(record.departureDateIso).format('MMMM D, YYYY')} at&nbsp;
              {getTime(record.departureDateIso)}
            </div>
            <div style={{ marginTop: 10 }}>
              {`${totalAvailable} slot/s left`}
              &nbsp;
              <Popover title={'Available Slots'} content={slotsPopoverContent}>
                <InfoCircleOutlined />
              </Popover>
            </div>
            <div>{`${record.availableVehicleCapacity} vehicle slot/s left`}</div>
            <div className={styles['price']} style={{ marginTop: 10 }}>
              {`PHP ${minFare}`}&nbsp;
              <Popover title={'Cabin Fares'} content={farePopoverContent}>
                <InfoCircleOutlined />
              </Popover>
            </div>
            <div>
              <TripActionButton trip={record} />,
            </div>
          </span>
        );
      },
      align: 'right',
      responsive: ['xs'],
    },
  ];

  useEffect(() => {
    setPage(1);
    fetchTrips();
  }, [searchQuery, loggedInAccount]);

  useEffect(() => {
    fetchTrips();
  }, [page]);

  const fetchTrips = async () => {
    setLoading(true);
    const trips = await getAvailableTrips(searchQuery);
    const tripData = find(trips?.data, { page });

    setTripData(tripData?.availableTrips || []);
    setTotalPages(totalPages);
    setTotalItems(
      tripData?.availableTrips ? tripData?.availableTrips.length : 0
    );
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
          rowKey={(trip) => trip.id}
          rowClassName={(trip, index) =>
            trip.id === selectedTrip?.id ? styles['selected'] : ''
          }
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
