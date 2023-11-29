import BarChart from '@/components/charts/BarChart';
import { buildPaxAndVehicleBookedData } from '@/services/dashboard.service';
import { getTripInformation } from '@/services/search.service';
import { ArrowRightOutlined, BarChartOutlined } from '@ant-design/icons';
import { DashboardTrips, TripSearchByDateRange } from '@ayahay/http';
import {
  getFullDate,
  getLocaleTimeString,
} from '@ayahay/services/date.service';
import { Skeleton, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import styles from './page.module.scss';
import { isEmpty } from 'lodash';
import { useAuth } from '../contexts/AuthContext';

const columns: ColumnsType<DashboardTrips> = [
  {
    title: 'Route',
    key: 'srcDestPort',
    render: (_: string, record: DashboardTrips) => (
      <span>
        {record.srcPort!.name} <ArrowRightOutlined rev={undefined} />
        &nbsp;
        {record.destPort!.name}
      </span>
    ),
    align: 'center',
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
    align: 'center',
  },
  {
    title: 'Pax Onboarded',
    key: 'paxOnboardedOverBooked',
    render: (_: string, record: DashboardTrips) => (
      <div>
        <span>{record.checkedInPassengerCount ?? 0}</span>/
        <span>{record.passengerCapacities - record.availableCapacities}</span>
      </div>
    ),
    align: 'center',
  },
];

interface DashboardTableProps {
  searchQuery: TripSearchByDateRange | undefined;
}

export default function DashboardTable({ searchQuery }: DashboardTableProps) {
  const { loggedInAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tripInfo, setTripInfo] = useState([] as DashboardTrips[] | undefined);

  useEffect(() => {
    getTripInfo();
  }, [loggedInAccount, searchQuery]);

  const getTripInfo = async () => {
    setLoading(true);
    // if no startDate and endDate was provided
    if (isEmpty(searchQuery)) {
      return;
    }
    const tripInfo = await getTripInformation(
      searchQuery.startDate,
      searchQuery.endDate
    );
    setTripInfo(tripInfo);
    setLoading(false);
  };

  const paxAndVehicleBookedData = buildPaxAndVehicleBookedData(tripInfo!);

  return (
    <>
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
      </Skeleton>
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
    </>
  );
}
