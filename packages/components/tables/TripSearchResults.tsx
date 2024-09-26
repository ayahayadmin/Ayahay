import styles from './TripSearchResults.module.scss';
import React, { useEffect } from 'react';
import { Button, Popover, Table } from 'antd';
import { ITrip, IShippingLine, ITripCabin } from '@ayahay/models';
import { PaginatedRequest, TripsSearchQuery } from '@ayahay/http';
import { forEach, sumBy } from 'lodash';
import {
  getAvailableTrips,
  getCabinCapacities,
  getCabinFares,
  getMaximumFare,
} from '@ayahay/services/trip.service';
import { toPhilippinesTime } from '@ayahay/services/date.service';
import { ArrowRightOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useShippingLineForWhiteLabel } from '@/hooks/shipping-line';
import { useServerPagination } from '@ayahay/hooks';

interface TripSearchResultsProps {
  searchQuery: TripsSearchQuery;
  excludeTripId?: number;
  selectedTrip?: ITrip;
  onSelectTrip?: (trip: ITrip) => void;
}

export function getCabinPopoverContent(cabinCapacities: any[]) {
  let tooltipTitle = '';
  forEach(cabinCapacities, (cabin, idx) => {
    if (idx === cabinCapacities.length - 1) {
      tooltipTitle += `${cabin.name}: ${cabin.available}/${cabin.total}`;
    } else {
      tooltipTitle += `${cabin.name}: ${cabin.available}/${cabin.total}; `;
    }
  });

  return tooltipTitle;
}

export function getFarePopoverContent(adultFares: any[]) {
  let tooltipTitle = '';
  forEach(adultFares, (fare, idx) => {
    if (idx === adultFares.length - 1) {
      tooltipTitle += `${fare.name}: ${fare.fare}`;
    } else {
      tooltipTitle += `${fare.name}: ${fare.fare}; `;
    }
  });

  return tooltipTitle;
}

export default function TripSearchResults({
  searchQuery,
  excludeTripId,
  selectedTrip,
  onSelectTrip,
}: TripSearchResultsProps) {
  const shippingLine = useShippingLineForWhiteLabel();

  const TripActionButton = ({ trip }: { trip: ITrip }) => (
    <Button
      type='primary'
      size='large'
      disabled={trip.id === selectedTrip?.id || trip.id === excludeTripId}
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
      render: (departureDateIso: string) =>
        toPhilippinesTime(departureDateIso, 'MMMM D, YYYY [at] h:mm A'),
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
            {toPhilippinesTime(
              record.departureDateIso,
              'MMMM D, YYYY [at] h:mm A'
            )}
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
              <TripActionButton trip={record} />
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
              {toPhilippinesTime(
                record.departureDateIso,
                'MMMM D, YYYY [at] h:mm A'
              )}
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

  useEffect(() => resetData(), [searchQuery]);

  const fetchTrips = async (pagination: PaginatedRequest) => {
    return getAvailableTrips(shippingLine?.id, searchQuery, pagination);
  };

  const {
    dataInPage: trips,
    totalCount,
    antdPagination,
    antdOnChange,
    resetData,
  } = useServerPagination<ITrip>(fetchTrips, true);

  return (
    <>
      <div className={styles['results-container']}>
        <strong>{totalCount} result(s)</strong> based on the search
      </div>
      <Table
        columns={columns}
        dataSource={trips}
        pagination={antdPagination}
        onChange={antdOnChange}
        loading={trips === undefined}
        rowKey={(trip) => trip.id}
        rowClassName={(trip, index) =>
          trip.id === selectedTrip?.id ? styles['selected'] : ''
        }
        showHeader={false}
        className={styles['search-result']}
      />
    </>
  );
}
