import React, { useEffect, useState } from 'react';
import { ITrip } from '@ayahay/models/trip.model';
import { Button, DatePicker, Dropdown, MenuProps, Skeleton } from 'antd';
import { useRouter } from 'next/navigation';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import { IPort } from '@ayahay/models/port.model';
import dayjs, { Dayjs } from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { getTripsByDateRange } from '@/services/trip.service';
import { PlusCircleOutlined } from '@ant-design/icons';
import Table, { ColumnsType } from 'antd/es/table';
import CabinAndVehicleEditCapacity from '@/components/form/CabinAndVehicleEditCapacity';
import { useAuth } from '../contexts/AuthContext';
import {
  getFullDate,
  getLocaleTimeString,
} from '@ayahay/services/date.service';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';

const { RangePicker } = DatePicker;
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const items: MenuProps['items'] = [
  {
    label: <a href='/trips/create'>From Schedules</a>,
    key: '0',
  },
  {
    label: <a href='/upload/trips'>From CSV</a>,
    key: '1',
  },
];

const columns: ColumnsType<ITrip> = [
  {
    key: 'logo',
    dataIndex: 'shippingLine',
    render: (text: IShippingLine) => (
      <img src='/assets/aznar-logo.png' alt={`${text.name} Logo`} height={80} />
    ),
    align: 'center',
  },
  {
    title: 'Origin',
    key: 'srcPort',
    dataIndex: 'srcPort',
    render: (text: IPort) => <span>{text.name}</span>,
  },
  {
    title: 'Destination',
    key: 'destPort',
    dataIndex: 'destPort',
    render: (text: IPort) => <span>{text.name}</span>,
  },
  {
    title: 'Departure Date',
    key: 'departureDateIso',
    dataIndex: 'departureDateIso',
    render: (departureDate: string) => (
      <div>
        <span>{getFullDate(departureDate)}</span>
        <br></br>
        <span>{getLocaleTimeString(departureDate)}</span>
      </div>
    ),
  },
  {
    title: 'Manifest',
    render: (_, record: ITrip) => (
      <Button
        type='primary'
        href={`/trips/${record.id}/manifest`}
        target='_blank'
      >
        View
      </Button>
    ),
  },
];
const adminOnlyColumns = [
  {
    title: 'Capacities',
    key: 'editCapacities',
    render: (text: string, record: ITrip) => (
      <div>
        <CabinAndVehicleEditCapacity
          tripId={record.id}
          cabins={record.availableCabins}
          vehicleCapacity={record.vehicleCapacity}
        />
      </div>
    ),
  },
];
const PAGE_SIZE = 10;

interface TripListProps {
  hasAdminPrivileges: boolean;
}

export default function TripList({ hasAdminPrivileges }: TripListProps) {
  const dateToday = dayjs();
  const [tripsData, setTripsData] = useState([] as ITrip[]);
  const [startDate, setStartDate] = useState(dateToday.startOf('day') as Dayjs);
  const [endDate, setEndDate] = useState(dateToday.endOf('day') as Dayjs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, [startDate, endDate]);

  const fetchTrips = async () => {
    setLoading(true);
    const trips = await getTripsByDateRange(
      startDate.toISOString(),
      endDate.toISOString()
    );
    setTripsData(trips);
    setLoading(false);
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const onChange: RangePickerProps['onChange'] = (date, dateString) => {
    setStartDate(dayjs(dateString[0]).startOf('day'));
    setEndDate(dayjs(dateString[1]).endOf('day'));
  };

  return (
    <div>
      <div>
        <RangePicker
          defaultValue={[startDate, endDate]}
          disabledDate={disabledDate}
          onChange={onChange}
          style={{ float: 'left', minWidth: '20%', margin: '10px 0px' }}
          format={DATE_FORMAT_LIST}
          placeholder={[DATE_PLACEHOLDER, DATE_PLACEHOLDER]}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {hasAdminPrivileges && (
            <Dropdown menu={{ items }} trigger={['click']}>
              <Button
                type='primary'
                icon={<PlusCircleOutlined rev={undefined} />}
              >
                Create Trip
              </Button>
            </Dropdown>
          )}
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <Skeleton
          loading={loading}
          active
          title={false}
          paragraph={{
            rows: 5,
            width: ['98%', '98%', '98%', '98%', '98%'],
          }}
        >
          {tripsData && (
            <Table
              columns={
                hasAdminPrivileges ? [...columns, ...adminOnlyColumns] : columns
              }
              dataSource={tripsData}
              pagination={false}
            ></Table>
          )}
        </Skeleton>
      </div>
    </div>
  );
}
