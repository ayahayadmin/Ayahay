'use client';
import BarChart from '@/components/charts/BarChart';
import {
  Button,
  DatePicker,
  Popover,
  Skeleton,
  Spin,
  TimeRangePickerProps,
  Typography,
} from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import styles from './page.module.scss';
import { useAuthState } from '@/hooks/auth';
import { redirect } from 'next/navigation';
import { useLoggedInAccount } from '@ayahay/hooks/auth';
import Table, { ColumnsType } from 'antd/es/table';
import { getTripInformation } from '@/services/search.service';
import { TripRatesModal } from '@/components/modal/TripRatesModal';
import { BarChartOutlined, StockOutlined } from '@ant-design/icons';
import { DashboardTrips } from '@ayahay/http';
import { buildPaxAndVehicleBookedData } from '@/services/dashboard.service';

const { Title } = Typography;
const { RangePicker } = DatePicker;
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const rangePresets: TimeRangePickerProps['presets'] = [
  { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
];

const columns: ColumnsType<DashboardTrips> = [
  {
    title: 'Origin',
    key: 'srcPort',
    render: (text: string, record: DashboardTrips) => (
      <span>{record.srcPort!.name}</span>
    ),
  },
  {
    title: 'Destination',
    key: 'destPort',
    render: (text: string, record: DashboardTrips) => (
      <span>{record.destPort!.name}</span>
    ),
  },
  {
    title: 'Departure Date',
    key: 'departureDateIso',
    dataIndex: 'departureDateIso',
    render: (text: string) => <span>{dayjs(text).format('MMMM D, YYYY')}</span>,
  },
  {
    title: 'Vessel',
    key: 'shipName',
    render: (text: string, record: DashboardTrips) => (
      <span>{record.ship?.name}</span>
    ),
  },
  {
    title: 'Pax Capacity',
    key: 'passengerCapacities',
    dataIndex: 'passengerCapacities',
  },
  {
    title: 'Vehicle Capacity',
    key: 'vehicleCapacity',
    dataIndex: 'vehicleCapacity',
  },
  {
    title: 'Pax Booked',
    key: 'passengerBooked',
    render: (text: string, record: DashboardTrips) => (
      <span>{record.passengerCapacities - record.availableCapacities}</span>
    ),
  },
  {
    title: 'Vehicle Booked',
    key: 'vehicleBooked',
    render: (text: string, record: DashboardTrips) => (
      <span>{record.vehicleCapacity - record.availableVehicleCapacity}</span>
    ),
  },
  {
    title: 'Onboarded Pax',
    key: 'checkedInPax',
    render: (text: string, record: DashboardTrips) => (
      <span>{record.checkedInPassengerCount ?? 0}</span>
    ),
  },
  {
    title: 'Onboarded Vehicle',
    key: 'checkedInVehicle',
    render: (text: string, record: DashboardTrips) => (
      <span>{record.checkedInVehicleCount ?? 0}</span>
    ),
  },
  {
    title: 'Rate',
    key: 'fare',
    render: (text: string, record: DashboardTrips) => (
      <Popover
        title={<Title level={2}>Rates</Title>}
        content={
          <TripRatesModal
            passengerRates={record.passengerRates}
            vehicleRates={record.vehicleRates}
          />
        }
        trigger='click'
      >
        <Button type='text'>
          <StockOutlined rev={undefined} />
        </Button>
      </Popover>
    ),
  },
];
const PAGE_SIZE = 10;

export default function Dashboard() {
  const { loggedInAccount } = useLoggedInAccount();
  const { pending, isSignedIn, user, auth } = useAuthState();
  const dateToday = dayjs();
  const [startDate, setStartDate] = useState(dateToday.startOf('day') as Dayjs);
  const [endDate, setEndDate] = useState(dateToday.endOf('day') as Dayjs);
  const [tripInfo, setTripInfo] = useState([] as DashboardTrips[] | undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTripInfo();
  }, [startDate, endDate]);

  const getTripInfo = async () => {
    setLoading(true);
    // if no startDate and endDate was provided
    if (
      startDate.toString() === 'Invalid Date' &&
      endDate.toString() === 'Invalid Date'
    ) {
      return;
    }
    const tripInfo = await getTripInformation({
      startDate,
      endDate,
    });
    setTripInfo(tripInfo);
    setLoading(false);
  };

  if (pending) {
    return <Spin size='large' className={styles['spinner']} />;
  }

  const allowedRoles = ['SuperAdmin', 'Admin'];
  if (!isSignedIn) {
    redirect('/');
  } else if (loggedInAccount && !allowedRoles.includes(loggedInAccount.role)) {
    redirect('/403');
  }

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    const lastYear = dateToday.subtract(1, 'year');
    return lastYear && current < lastYear.startOf('day');
  };

  const onChange: RangePickerProps['onChange'] = (date, dateString) => {
    setStartDate(dayjs(dateString[0]).startOf('day'));
    setEndDate(dayjs(dateString[1]).endOf('day'));
  };

  const paxAndVehicleBookedData = buildPaxAndVehicleBookedData(tripInfo!);

  return (
    <div className={styles['main-container']}>
      <div>
        <RangePicker
          defaultValue={[startDate, endDate]}
          presets={rangePresets}
          disabledDate={disabledDate}
          onChange={onChange}
          style={{ margin: '10px 0px' }}
        />
        <Skeleton
          loading={loading}
          active
          title={false}
          paragraph={{
            rows: 5,
            width: ['98%', '98%', '98%', '98%', '98%'],
          }}
        >
          <Table
            columns={columns}
            dataSource={tripInfo}
            pagination={false}
          ></Table>
          {/* {totalItems / PAGE_SIZE > 1 && (
          <Pagination
            total={totalItems}
            current={page}
            pageSize={PAGE_SIZE}
            onChange={(page) => setPage(page)}
          ></Pagination>
        )} */}
        </Skeleton>
      </div>

      <div className={styles['bar-graph']}>
        {loading && (
          <Skeleton.Node active>
            <BarChartOutlined
              style={{ fontSize: 40, color: '#bfbfbf' }}
              rev={undefined}
            />
          </Skeleton.Node>
        )}
        {paxAndVehicleBookedData && !loading && (
          <BarChart data={paxAndVehicleBookedData} />
        )}
      </div>
    </div>
  );
}
