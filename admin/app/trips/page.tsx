'use client';
import {
  buildSearchQueryFromRangePickerForm,
  buildUrlQueryParamsFromRangePickerForm,
  initializeRangePickerFormFromQueryParams,
} from '@/services/search.service';
import {
  Button,
  DatePicker,
  Dropdown,
  Form,
  MenuProps,
  notification,
} from 'antd';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { TripSearchByDateRange } from '@ayahay/http';
import TripList from './tripList';
import { useSearchParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/auth';
import styles from './page.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import { PlusCircleOutlined } from '@ant-design/icons';
import { setTripAsArrived, setTripAsCancelled } from '@/services/trip.service';
import CancelledTripModal from '@/components/modal/CancelledTripModal';

const { RangePicker } = DatePicker;
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

export default function Schedules() {
  useAuthGuard(['Staff', 'Admin', 'SuperAdmin']);
  const [api, contextHolder] = notification.useNotification();
  const { loggedInAccount } = useAuth();
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    {} as TripSearchByDateRange | undefined
  );
  const [hasAdminPrivileges, setHasAdminPrivileges] = useState(false);
  const [tripNumber, setTripNumber] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());
    initializeRangePickerFormFromQueryParams(form, params);
    debounceSearch();
  };

  const onSetTripAsArrived = async (tripId: number) => {
    try {
      await setTripAsArrived(tripId);
      api.success({
        message: 'Set Status Success',
        description: 'The status of the selected trip has been set to Arrived.',
      });
    } catch (e) {
      api.error({
        message: 'Set Status Failed',
        description: 'Something went wrong.',
      });
    }
  };

  const onSetTripAsCancelled = async (tripId: number) => {
    setTripNumber(tripId);
    setIsModalOpen(true);
  };

  useEffect(onPageLoad, []);

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }

    const _hasAdminPrivileges = loggedInAccount?.role !== 'Staff';
    setHasAdminPrivileges(_hasAdminPrivileges);

    if (!_hasAdminPrivileges) {
      return;
    }
  }, [loggedInAccount]);

  const debounceSearch = useCallback(debounce(performSearch, 300), []);

  function performSearch() {
    const query = buildSearchQueryFromRangePickerForm(form);
    setSearchQuery(query);
    updateUrl();
  }

  const updateUrl = () => {
    const updatedQueryParams = buildUrlQueryParamsFromRangePickerForm(form);
    const updatedUrl = `${window.location.origin}${window.location.pathname}?${updatedQueryParams}`;
    window.history.replaceState({ path: updatedUrl }, '', updatedUrl);
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    const lastYear = dayjs().subtract(1, 'year');
    return lastYear && current < lastYear.startOf('day');
  };

  return (
    <div className={styles['main-container']}>
      <Form
        form={form}
        initialValues={{ dateRange: [dayjs(), dayjs()] }}
        onValuesChange={(_, __) => debounceSearch()}
      >
        <div className={styles['form-item']}>
          <Form.Item name='dateRange' label='Date Range'>
            <RangePicker
              disabledDate={disabledDate}
              format={DATE_FORMAT_LIST}
              placeholder={[DATE_PLACEHOLDER, DATE_PLACEHOLDER]}
              className={styles['range-picker']}
            />
          </Form.Item>

          <div className={styles['create-button']}>
            {hasAdminPrivileges && (
              <Dropdown menu={{ items }} trigger={['click']}>
                <Button type='primary' icon={<PlusCircleOutlined />}>
                  Create Trip
                </Button>
              </Dropdown>
            )}
          </div>
        </div>
      </Form>

      <div>
        <TripList
          searchQuery={searchQuery}
          hasAdminPrivileges={hasAdminPrivileges}
          onSetTripAsArrived={onSetTripAsArrived}
          onSetTripAsCancelled={onSetTripAsCancelled}
        />
        {contextHolder}
        {/* <BookingList /> */}
        {/* <div className={styles.chart}>
          <PieChart data={data} />
        </div>
        <div className={styles.chart}>
          <BarChart data={data} />
        </div>
        <div className={styles.chart}>
          <LineChart data={data} />
        </div>
        <CabinFilter name='cabinTypes' label='Cabin Types' />
        <TripResults searchQuery={searchQuery} /> */}
      </div>
      <CancelledTripModal
        open={isModalOpen}
        tripId={tripNumber}
        setTripAsCancelled={setTripAsCancelled}
        setIsModalOpen={setIsModalOpen}
        api={api}
      />
    </div>
  );
}
