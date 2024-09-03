import BarChart from '@/components/charts/BarChart';
import { buildPaxAndVehicleBookedData } from '@/services/dashboard.service';
import { getDashboardTrips } from '@/services/search.service';
import {
  ArrowRightOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  DashboardTrips,
  PaginatedRequest,
  PortsAndDateRangeSearch,
} from '@ayahay/http';
import { Button, Popover, Skeleton, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect } from 'react';
import styles from './page.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import { NotCheckedInModal } from '@/components/modal/NotCheckedInModal';
import { useServerPagination } from '@ayahay/hooks';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

const columns: ColumnsType<DashboardTrips> = [
  {
    title: 'Route',
    key: 'srcDestPort',
    render: (_: string, record: DashboardTrips) => (
      <span>
        {record.srcPort!.name} <ArrowRightOutlined />
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
    render: (departureDateIso: string) => (
      <span>
        {dayjs(departureDateIso)
          .tz('Asia/Shanghai')
          .format('MM/DD/YYYY h:mm A')}
      </span>
    ),
    align: 'center',
  },
  {
    title: 'Pax Onboarded',
    key: 'paxOnboardedOverBooked',
    render: (_: string, record: DashboardTrips) => {
      const passengerNames = record.notCheckedInPassengerNames.map((name) => ({
        data: name,
      }));

      return (
        <div>
          <span>{record.checkedInPassengerCount ?? 0}</span>/
          <span>{record.passengerCapacities - record.availableCapacities}</span>
          &nbsp;
          <Popover
            content={<NotCheckedInModal data={passengerNames} />}
            trigger='click'
          >
            <Button type='text' style={{ padding: 0 }}>
              <InfoCircleOutlined rev={undefined} />
            </Button>
          </Popover>
        </div>
      );
    },
    align: 'center',
  },
  {
    title: 'Vehicle Onboarded',
    key: 'vehicleOnboardedOverBooked',
    render: (_: string, record: DashboardTrips) => {
      const plateNumbersAndModelName = record.notCheckedInVehicles.map(
        (plateNoAndModelName) => ({
          data: plateNoAndModelName,
        })
      );

      return (
        <div>
          <span>{record.checkedInVehicleCount ?? 0}</span>/
          <span>
            {record.vehicleCapacity - record.availableVehicleCapacity}
          </span>
          &nbsp;
          <Popover
            content={<NotCheckedInModal data={plateNumbersAndModelName} />}
            trigger='click'
          >
            <Button type='text' style={{ padding: 0 }}>
              <InfoCircleOutlined />
            </Button>
          </Popover>
        </div>
      );
    },
    align: 'center',
  },
];

interface DashboardTableProps {
  searchQuery: PortsAndDateRangeSearch | undefined;
}

export default function DashboardTable({ searchQuery }: DashboardTableProps) {
  const { loggedInAccount } = useAuth();
  useEffect(() => resetData(), [searchQuery]);

  const fetchTripInformation = async (pagination: PaginatedRequest) => {
    return getDashboardTrips(
      loggedInAccount?.shippingLineId,
      searchQuery,
      pagination
    );
  };

  const {
    dataInPage: tripInfo,
    antdPagination,
    antdOnChange,
    resetData,
  } = useServerPagination<DashboardTrips>(
    fetchTripInformation,
    loggedInAccount !== null && loggedInAccount !== undefined
  );

  const paxAndVehicleBookedData = buildPaxAndVehicleBookedData(tripInfo!);

  return (
    <>
      <Table
        dataSource={tripInfo}
        columns={columns}
        pagination={antdPagination}
        onChange={antdOnChange}
        loading={tripInfo === undefined}
        tableLayout='fixed'
        rowKey={(trip) => trip.id}
      />
      <div className={styles['bar-graph']}>
        {!tripInfo && (
          <Skeleton.Node active>
            <BarChartOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
          </Skeleton.Node>
        )}
        {paxAndVehicleBookedData && <BarChart data={paxAndVehicleBookedData} />}
      </div>
    </>
  );
}
