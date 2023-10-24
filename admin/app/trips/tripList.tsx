import React, { useEffect, useState } from 'react';
import { ITrip } from '@ayahay/models/trip.model';
import { split } from 'lodash';
import { getTime } from '@/services/search.service';
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
import { useLoggedInAccount } from '@ayahay/hooks/auth';
import Table, { ColumnsType } from 'antd/es/table';
import CabinAndVehicleEditCapacity from '@/components/form/CabinAndVehicleEditCapacity';

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
    key: 'departureDate',
    dataIndex: 'departureDateIso',
    render: (text: string) => <span>{split(text, 'T')[0]}</span>,
  },
  {
    title: 'Departure Time',
    key: 'departureTime',
    dataIndex: 'departureDateIso',
    render: (text: string) => <span>{getTime(text)}</span>,
  },
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

export default function TripList() {
  const { loggedInAccount } = useLoggedInAccount();
  const dateToday = dayjs();
  const [tripsData, setTripsData] = useState([] as ITrip[]);
  const [startDate, setStartDate] = useState(dateToday.startOf('day') as Dayjs);
  const [endDate, setEndDate] = useState(dateToday.endOf('day') as Dayjs);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const allowedRoles = ['Admin', 'SuperAdmin'];
  const isRoleAllowed =
    loggedInAccount && allowedRoles.includes(loggedInAccount?.role);

  return (
    <div>
      <div>
        <RangePicker
          defaultValue={[startDate, endDate]}
          disabledDate={disabledDate}
          onChange={onChange}
          style={{ float: 'left' }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {isRoleAllowed && (
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
              columns={isRoleAllowed ? columns : columns.slice(0, -1)} // don't include change capacity column if user is unauthorized
              dataSource={tripsData}
              pagination={false}
            ></Table>
          )}
        </Skeleton>
      </div>
    </div>
  );
}
